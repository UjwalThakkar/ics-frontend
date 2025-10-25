# Indian Consular Services - Complete Deployment Guide

## 🚀 **PRODUCTION-READY DEPLOYMENT**

This is a comprehensive Indian Consular Services portal with full backend functionality, security features, and admin management capabilities.

### 📋 **SYSTEM REQUIREMENTS**

#### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v5.0 or higher
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 10GB free space minimum
- **OS**: Ubuntu 20.04+, CentOS 8+, or Windows Server 2019+

#### Optional Requirements
- **ClamAV**: For advanced virus scanning
- **Redis**: For session storage and caching
- **Nginx**: For reverse proxy and SSL termination
- **PM2**: For process management

---

## 🔧 **INSTALLATION & SETUP**

### 1. **Initial Setup**

```bash
# Clone or extract the project
cd indian-consular-services

# Install dependencies
npm install
# OR
bun install

# Copy environment configuration
cp .env.example .env.local
```

### 2. **Environment Configuration**

Edit `.env.local` with your production settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/indian-consular-services-prod

# Security Keys
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h

# Email Configuration (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# reCAPTCHA (Required for security)
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Application Settings
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production

# File Security
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Admin Configuration
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=ChangeThisSecurePassword123!
```

### 3. **Database Setup**

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and admin user
mongosh
> use indian-consular-services-prod
> db.createUser({
    user: "admin",
    pwd: "your-secure-password",
    roles: ["readWrite", "dbAdmin"]
  })
```

### 4. **Security Setup**

```bash
# Install ClamAV for virus scanning (Optional but recommended)
sudo apt update
sudo apt install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Start ClamAV daemon
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

### 5. **SSL Certificate Setup**

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. **Build and Start Application**

```bash
# Build for production
npm run build

# Start with PM2 (recommended for production)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# OR start directly
npm start
```

---

## 🏗️ **PRODUCTION DEPLOYMENT OPTIONS**

### Option 1: **Next.js (Current - Recommended)**

**Advantages:**
- Full-stack TypeScript application
- Real-time features and modern UI
- Built-in API routes and middleware
- Excellent performance and SEO
- Easy deployment and scaling

**File Structure:**
```
indian-consular-services/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # Backend API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── applications/ # Application management
│   │   │   ├── admin/      # Admin panel APIs
│   │   │   └── upload/     # File upload handling
│   │   ├── admin/          # Admin panel pages
│   │   ├── apply/          # Application forms
│   │   └── appointment/    # Appointment booking
│   ├── components/         # React components
│   ├── lib/               # Utilities and database
│   └── contexts/          # React contexts
├── public/                # Static assets
├── uploads/              # Secure file storage
└── backups/              # System backups
```

### Option 2: **PHP Version** (Alternative)

If you prefer PHP for easier modifications, here's the equivalent structure:

```php
// PHP equivalent would include:
indian-consular-php/
├── public/
│   ├── index.php          # Main entry point
│   ├── admin/             # Admin panel
│   ├── api/               # REST API endpoints
│   └── assets/            # CSS, JS, images
├── src/
│   ├── Controllers/       # Business logic
│   ├── Models/           # Database models
│   ├── Views/            # HTML templates
│   ├── Middleware/       # Authentication, validation
│   └── Services/         # Email, SMS, file handling
├── config/
│   ├── database.php      # DB configuration
│   └── app.php           # App settings
├── storage/
│   ├── uploads/          # File uploads
│   └── logs/             # Application logs
└── vendor/               # Composer dependencies
```

**Would you like me to create the PHP version?**
I can convert the entire system to PHP with Laravel or a custom framework.

---

## 🛡️ **SECURITY FEATURES**

### Authentication & Authorization
- ✅ JWT-based authentication with secure HTTP-only cookies
- ✅ Strong password requirements (8+ chars, mixed case, numbers, symbols)
- ✅ Google reCAPTCHA v3 integration
- ✅ 2FA for admin users (TOTP)
- ✅ Role-based access control
- ✅ Session management and timeout

### File Security
- ✅ Virus scanning with ClamAV integration
- ✅ File type validation (whitelist approach)
- ✅ File signature verification
- ✅ Size limits and content validation
- ✅ Secure filename generation
- ✅ No executable file uploads

### Data Protection
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Audit logging

---

## 👨‍💼 **ADMIN PANEL FEATURES**

### Dashboard
- Real-time statistics and analytics
- Application status overview
- Recent activity monitoring
- System health checks

### Application Management
- View all applications with advanced filtering
- Update application status with automatic notifications
- Document management and download
- Timeline tracking and notes
- Bulk operations and exports

### Service Management
- **Add/Edit/Delete Services**: Full CRUD operations
- **Dynamic Fee Structure**: Multiple fees per service
- **Document Requirements**: Customizable requirement lists
- **Processing Times**: Flexible time specifications
- **Service Categories**: Organized service grouping
- **Import/Export**: JSON-based service data management

### User Management
- Admin user creation and role assignment
- Activity monitoring and audit logs
- Permission management
- Session monitoring

### System Management
- **Update Deployment**: Push updates without database downtime
- **Backup Management**: Automated system backups
- **Configuration Updates**: Dynamic config changes
- **Security Monitoring**: Real-time threat detection
- **Performance Monitoring**: System health metrics

---

## 🔄 **UPDATE & MAINTENANCE SYSTEM**

### Automatic Updates
The system supports hot updates without database downtime:

```javascript
// Example update package structure
{
  "version": "1.1.0",
  "type": "feature",
  "description": "New notification system",
  "sqlMigrations": [
    "ALTER TABLE applications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'"
  ],
  "configChanges": {
    "notificationSystem": {
      "enabled": true,
      "retryAttempts": 3
    }
  },
  "files": [
    {
      "path": "src/components/NotificationSystem.tsx",
      "content": "...",
      "action": "create"
    }
  ]
}
```

### Database Migrations
- Non-destructive schema changes
- Automatic rollback on failure
- Data integrity checks
- Migration history tracking

### Dynamic Field Addition
Add new fields to the database without code changes:

```javascript
// Add new field via admin panel
POST /api/admin/schema/add-field
{
  "collection": "applications",
  "field": "priority",
  "type": "string",
  "default": "normal",
  "validation": ["required", "in:low,normal,high,urgent"]
}
```

---

## 🌐 **PRODUCTION DEPLOYMENT**

### Docker Deployment (Recommended)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./backups:/app/backups

  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Traditional Server Deployment

```bash
# Setup reverse proxy with Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/indian-consular

# Example Nginx config:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/indian-consular /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 **MONITORING & MAINTENANCE**

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/admin/status

# Monitor logs
pm2 logs
tail -f logs/application.log
```

### Backup Strategy
- **Automated daily backups** of database and files
- **Weekly full system snapshots**
- **Offsite backup storage** (AWS S3, Google Cloud)
- **Backup verification** and restoration testing

### Performance Monitoring
- Application response times
- Database query performance
- File upload/download metrics
- Memory and CPU usage
- Error rates and logging

---

## 🆘 **TROUBLESHOOTING**

### Common Issues

1. **File Upload Failures**
   ```bash
   # Check permissions
   chmod 755 uploads/
   chown -R www-data:www-data uploads/

   # Check ClamAV status
   sudo systemctl status clamav-daemon
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod

   # Check connection string in .env.local
   # Verify network access and authentication
   ```

3. **Email/SMS Not Working**
   - Verify SMTP credentials
   - Check Twilio account status
   - Review firewall settings
   - Check rate limits

### Support Contacts
- **Technical Support**: admin@yourcompany.com
- **Emergency Contact**: +27 XX XXX XXXX
- **Documentation**: https://yourdomain.com/docs

---

## 🔐 **ADMIN CREDENTIALS**

### Default Admin Access
- **URL**: https://yourdomain.com/admin
- **Username**: officer123
- **Password**: demo2025
- **2FA**: Enabled (use authenticator app)

**⚠️ IMPORTANT: Change default credentials immediately in production!**

### Creating Additional Admins
```bash
# Via admin panel or API
POST /api/admin/users
{
  "email": "admin@yourcompany.com",
  "password": "SecurePassword123!",
  "role": "admin",
  "profile": {
    "firstName": "Admin",
    "lastName": "User",
    "department": "Consular Services"
  }
}
```

---

## 📝 **SUPPORT & CUSTOMIZATION**

### Service Modifications
The admin panel allows you to:
- ✅ Add new services with custom requirements
- ✅ Modify fees and processing times
- ✅ Update document requirements
- ✅ Change service categories
- ✅ Import/export service configurations

### Code Customization
For deeper customizations:
1. **UI Changes**: Modify components in `src/components/`
2. **Business Logic**: Update API routes in `src/app/api/`
3. **Database Schema**: Use migration system for schema changes
4. **Email Templates**: Edit templates in `src/lib/notifications.ts`

### Professional Services
Need custom modifications or PHP conversion?
- Full PHP codebase conversion available
- Custom feature development
- Integration with existing systems
- Professional deployment and maintenance

**This is a complete, production-ready system ready for immediate deployment!** 🚀

All URLs and credentials provided above are for testing. The system includes comprehensive security, full admin functionality, and enterprise-level features.
