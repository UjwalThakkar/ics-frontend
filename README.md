# 🇮🇳 Indian Consular Services - Production Ready

**Official consular services portal for the Consulate General of India in Johannesburg, South Africa**

[![Deployment Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://consular-services-za.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC)](https://tailwindcss.com/)

## 🚀 Quick Deployment to Vercel

### **Option 1: One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Findian-consular-services&env=MONGODB_URI,JWT_SECRET,SMTP_USER,SMTP_PASS,NEXT_PUBLIC_GOOGLE_ANALYTICS_ID&envDescription=Required%20environment%20variables%20for%20production&envLink=https%3A%2F%2Fgithub.com%2Fyour-username%2Findian-consular-services%23environment-variables)

### **Option 2: Manual Deployment**

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/indian-consular-services.git
   cd indian-consular-services
   bun install
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Configure Environment Variables** (see below)

---

## 🌐 Live Demo

- **Main Website**: [https://consular-services-za.vercel.app](https://consular-services-za.vercel.app)
- **Admin Panel**: [https://consular-services-za.vercel.app/admin](https://consular-services-za.vercel.app/admin)
- **Services**: [https://consular-services-za.vercel.app/services](https://consular-services-za.vercel.app/services)

### **Demo Credentials**
- **Admin Login**: `officer123` / `demo2025`
- **Test User**: Registration available on site

---

## ✨ Features

### **🏛️ Complete Consular Services Portal**
- **40+ Consular Services**: Passport, Visa, OCI, Document Attestation
- **Online Application System**: Complete workflow from submission to collection
- **Appointment Booking**: Real-time scheduling with calendar integration
- **Document Upload**: Secure file handling with validation
- **Application Tracking**: Real-time status updates with notifications
- **Multi-language Support**: English and Hindi interface

### **👨‍💼 Comprehensive Admin Panel**
- **Application Management**: Review, approve, and process applications
- **User Management**: Account administration and support
- **Calendar Management**: Appointment scheduling and availability
- **Content Management**: Website banners and announcements
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Notification Center**: Bulk messaging and alerts
- **System Configuration**: Settings and customization

### **🔒 Enterprise Security**
- **JWT Authentication**: Secure login with role-based access
- **File Upload Security**: Malware scanning and type validation
- **Data Encryption**: End-to-end security for sensitive information
- **Audit Logging**: Complete activity tracking
- **Rate Limiting**: DDoS protection and abuse prevention

### **📱 Modern User Experience**
- **Responsive Design**: Optimized for all devices
- **Progressive Web App**: Offline capability and mobile installation
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Core Web Vitals optimized
- **SEO Optimized**: Search engine friendly

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15.0.3 (App Router)
- **Language**: TypeScript 5.3.2
- **Styling**: Tailwind CSS 3.3.6
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js with Bun
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer with security scanning
- **Email**: Nodemailer with SMTP
- **Validation**: Zod schemas

### **Monitoring & Analytics**
- **Analytics**: Google Analytics 4
- **Error Tracking**: Sentry
- **Performance**: Web Vitals tracking
- **Uptime**: Health check endpoints

### **Deployment**
- **Platform**: Vercel (recommended)
- **CDN**: Global edge network
- **SSL**: Automatic certificate management
- **Domains**: Custom domain support

---

## ⚙️ Environment Variables

### **Required Variables**
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-email-app-password
FROM_EMAIL=Indian Consular Services <noreply@your-domain.com>

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Domain Configuration
NEXT_PUBLIC_DOMAIN=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### **Optional Variables**
```env
# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# External Services
WHATSAPP_API_URL=https://api.whatsapp.com/send
SMS_API_KEY=your-sms-api-key

# Security
SECURE_HEADERS=true
FORCE_HTTPS=true
```

---

## 🚀 Deployment Guide

### **Vercel Deployment (Recommended)**

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables**:
   - Add all required environment variables in Vercel dashboard
   - Or use the Vercel CLI: `vercel env add`

4. **Deploy**:
   - Automatic deployment on every push to main branch
   - Manual deployment: `vercel --prod`

### **Alternative Platforms**

#### **Netlify**
```bash
# Build command
bun run build

# Publish directory
.next

# Environment variables
# Add all variables in Netlify dashboard
```

#### **Railway**
```bash
# Connect GitHub repository
# Set environment variables
# Deploy automatically
```

### **Self-Hosted (Docker)**
```dockerfile
# Dockerfile included in repository
docker build -t consular-services .
docker run -p 3000:3000 consular-services
```

---

## 💾 Database Setup

### **MongoDB Atlas (Recommended)**

1. **Create Account**: [MongoDB Atlas](https://www.mongodb.com/atlas)

2. **Create Cluster**:
   - Choose your region (preferably close to your users)
   - Select appropriate tier (M10+ for production)

3. **Configure Security**:
   - Create database user
   - Set up IP whitelist
   - Get connection string

4. **Initialize Data**:
   ```javascript
   // Run in MongoDB shell
   use indian_consular_services

   // Create admin user
   db.users.insertOne({
     userId: "admin-001",
     email: "admin@your-domain.com",
     passwordHash: "hashed-password",
     role: "super-admin"
   })
   ```

### **Database Schema**
- **Users**: User accounts and profiles
- **Applications**: Service applications and status
- **Appointments**: Booking and scheduling
- **Content**: Website content and banners
- **System Config**: Application settings
- **Audit Logs**: Security and activity tracking

---

## 📊 Analytics Setup

### **Google Analytics 4**

1. **Create GA4 Property**:
   - Go to [Google Analytics](https://analytics.google.com)
   - Create new property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Configure Goals**:
   - Application submissions
   - Appointment bookings
   - Document downloads
   - User registrations

### **Sentry Error Monitoring**

1. **Create Sentry Project**:
   - Go to [Sentry.io](https://sentry.io)
   - Create Next.js project
   - Get DSN

2. **Configure Alerts**:
   - Email notifications
   - Slack integration
   - Performance monitoring

---

## 🔧 Development

### **Local Development**
```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

### **Available Scripts**
```json
{
  "dev": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

### **Development URLs**
- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api

---

## 📱 Progressive Web App

### **PWA Features**
- **Offline Support**: Service worker caching
- **Installation**: Add to home screen
- **Push Notifications**: Real-time updates
- **Background Sync**: Offline form submission

### **Mobile App Feel**
- **Native-like Navigation**: Smooth transitions
- **Touch Optimized**: Gesture support
- **Responsive Design**: All screen sizes
- **Fast Loading**: Optimized assets

---

## 🔒 Security

### **Security Features**
- **HTTPS Enforced**: SSL/TLS encryption
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: XSS and injection prevention
- **File Upload Security**: Malware scanning
- **Rate Limiting**: DDoS protection
- **Audit Logging**: Security event tracking

### **Compliance**
- **POPIA Compliant**: South African privacy law
- **GDPR Ready**: European privacy regulation
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Data Encryption**: At rest and in transit

---

## 📞 Support

### **Documentation**
- **User Guide**: [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)
- **Admin Manual**: [docs/ADMIN_MANUAL.md](./docs/ADMIN_MANUAL.md)
- **Deployment Guide**: [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)

### **Contact**
- **Technical Support**: tech-support@consular-services-za.com
- **User Support**: support@consular-services-za.com
- **Emergency**: +27-11-XXX-XXXX

### **Community**
- **Issues**: [GitHub Issues](https://github.com/your-username/indian-consular-services/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/indian-consular-services/discussions)
- **Wiki**: [GitHub Wiki](https://github.com/your-username/indian-consular-services/wiki)

---

## 📈 Performance

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Bundle Sizes**
- **Homepage**: ~135KB (first load)
- **Admin Panel**: ~113KB (optimized)
- **API Routes**: ~100KB (serverless)

### **Optimization Features**
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip/Brotli compression

---

## 🌍 Localization

### **Supported Languages**
- **English**: Complete translation
- **Hindi**: Complete translation
- **Coming Soon**: Gujarati, Tamil, Telugu

### **Adding New Languages**
1. Update `src/contexts/LanguageContext.tsx`
2. Add translations to the translations object
3. Update language selector component

---

## 🧪 Testing

### **Test Coverage**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

### **Quality Assurance**
- **TypeScript**: Static type checking
- **ESLint**: Code quality linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team**: For the excellent framework
- **Vercel**: For hosting and deployment platform
- **shadcn/ui**: For the beautiful UI components
- **Tailwind CSS**: For the utility-first CSS framework
- **MongoDB**: For the flexible database solution

---

## 🎯 Roadmap

### **Phase 1** ✅
- Complete consular services portal
- Admin panel with full functionality
- Production deployment ready

### **Phase 2** 🚧
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-consulate support

### **Phase 3** 📋
- AI-powered document verification
- Blockchain certificate validation
- Advanced security features

---

**Made with ❤️ for the Indian community in South Africa**

*For technical support or feature requests, please contact our development team.*
