# 🔐 Authentication Integration Guide

## ✅ What Has Been Implemented

### 1. **Environment Configuration**

- Created `.env.local` with PHP backend URL: `http://localhost:8000/api`
- Configuration is automatically loaded by Next.js

### 2. **AuthContext (Global Authentication State)**

-**File**: `/app/src/contexts/AuthContext.tsx`

-**Features**:

- Global user authentication state management
- Token storage and persistence (localStorage)
- Login/logout functionality
- User data management
- Authentication status checking
- Auto-restore session on page reload

### 3. **Updated AuthModal Component**

-**File**: `/app/src/components/AuthModal.tsx`

-**Changes**:

- ✅ **Login**: Connected to real PHP API (`POST /auth/login`)
- ✅ **Registration**: Mock implementation (ready for backend endpoint)
- ✅ Added username field for login
- ✅ Separated email field (only for registration)
- ✅ Error handling with user-friendly messages
- ✅ Loading states during API calls
- ✅ Success feedback

### 4. **Updated Header Component**

-**File**: `/app/src/components/Header.tsx`

-**Changes**:

- Shows user info when authenticated (username + role badge)
- Real logout functionality
- Dynamic UI based on auth state

### 5. **PHP API Client**

-**File**: `/app/src/lib/php-api-client.ts` (already existed, enhanced)

-**Features**:

- Handles all API requests to PHP backend
- JWT token management
- Automatic token inclusion in headers
- Comprehensive error handling
- CORS configuration
- Debug logging

---

## 🚀 How to Test

### Prerequisites

1.**PHP Backend must be running** on `http://localhost:8000`

2. Your PHP backend should have the `/api/auth/login` endpoint ready

### Step 1: Start Next.js Development Server

```bash

cd/app

yarndev

```

The app will start on `http://localhost:3000`

### Step 2: Test Login Flow

1. Open the application in your browser: `http://localhost:3000`
2. Click "Login" button in the header
3. Enter credentials:

   -**Username**: `officer123` (or any username from your PHP backend)

   -**Password**: `demo2025` (or your test password)
4. Click "Sign In"

### Expected Behavior:

#### ✅ **If PHP Backend is Running:**

- Login request sent to `http://localhost:8000/api/auth/login`
- On success:

  - User info displayed in header
  - JWT token stored in localStorage
  - Success message shown
  - Modal closes automatically
- On failure:

  - Error message displayed in the modal

#### ❌ **If PHP Backend is NOT Running:**

- Error message: "Cannot connect to authentication server. Please ensure the backend is running."
- Check browser console for detailed error logs

### Step 3: Test Registration (Mock)

1. Click "Create Account" in the auth modal
2. Fill in the form (all fields are validated)
3. Click "Create Account"
4. Mock OTP verification screen appears
5. Enter any 6-digit code
6. Success message shown

**Note**: Registration is mocked and will be connected once you create the backend endpoint.

---

## 🔍 Debugging & Logs

### Browser Console Logs

All API requests are logged with emojis for easy identification:

- 🔐 Login attempt
- 🌐 API requests
- ✅ Successful responses
- ❌ Errors with detailed info
- 📦 Response data

### Check Authentication State

Open browser console and run:

```javascript

// Check if user is logged in

localStorage.getItem('auth_token')

localStorage.getItem('user')

```

### Clear Authentication

```javascript

localStorage.removeItem('auth_token')

localStorage.removeItem('user')

// Then refresh the page

```

---

## 📋 API Integration Details

### Login Endpoint

**Request**:

```

POST http://localhost:8000/api/auth/login

Content-Type: application/json


{

  "username": "officer123",

  "password": "demo2025"

}

```

**Expected Response**:

```json

{

  "success": true,

  "data": {

    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",

    "user": {

      "id": "ADMIN001",

      "username": "officer123",

      "role": "admin",

      "permissions": ["all"]

    }

  }

}

```

### Token Usage

After successful login, all subsequent API requests include:

```

Authorization: Bearer <token>

```

---

## 🔧 Configuration

### Change Backend URL

Edit `/app/.env.local`:

```env

NEXT_PUBLIC_API_URL=http://your-domain.com/api

```

Restart the Next.js dev server after changing environment variables.

---

## 🎯 Next Steps

### For Production:

1. ✅ Login is connected
2. ⏳ Connect registration to real endpoint when available
3. ⏳ Add password reset functionality
4. ⏳ Add email verification
5. ⏳ Add protected routes (redirect if not authenticated)
6. ⏳ Add refresh token mechanism
7. ⏳ Add session timeout handling

### Backend Requirements:

Your PHP backend needs to:

1. ✅ Return JWT token on successful login
2. ✅ Return user object with id, username, role
3. ⏳ Accept JWT token in Authorization header
4. ⏳ Validate token on protected endpoints

---

## 📁 File Structure

```

/app/

├── .env.local                          # Environment config (NEW)

├── src/

│   ├── contexts/

│   │   ├── AuthContext.tsx             # Auth state management (NEW)

│   │   └── LanguageContext.tsx

│   ├── components/

│   │   ├── AuthModal.tsx               # Updated with real API

│   │   └── Header.tsx                  # Updated with auth state

│   └── lib/

│       └── php-api-client.ts           # API client (enhanced)

```

---

## ⚠️ Important Notes

1.**CORS Configuration**: Make sure your PHP backend allows requests from `http://localhost:3000`

2.**Token Expiry**: The current implementation doesn't handle token expiry. You'll need to add refresh token logic.

3.**Security**:

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Always use HTTPS in production
- Implement CSRF protection

4.**Error Handling**: All errors are caught and displayed to users with friendly messages

---

## 🐛 Common Issues

### Issue: "Cannot connect to authentication server"

**Solution**:

- Ensure PHP backend is running on `http://localhost:8000`
- Check CORS headers in PHP backend
- Verify firewall settings

### Issue: "Network Error"

**Solution**:

- Check browser console for detailed error
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Test PHP backend directly: `curl http://localhost:8000/api/health`

### Issue: Login successful but user info not showing

**Solution**:

- Clear browser cache and localStorage
- Check browser console for errors
- Verify PHP backend returns correct user object structure

---

## 📞 Support

For issues or questions about the integration, check:

1. Browser console logs (detailed error information)
2. Network tab in browser dev tools (see actual API requests/responses)
3. PHP backend logs

---

**✨ Your authentication system is now connected and ready to use!**
