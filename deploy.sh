#!/bin/bash

# 🚀 Indian Consular Services - Vercel Deployment Script
# This script will guide you through deploying to Vercel production

set -e

echo "🇮🇳 Indian Consular Services - Production Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    print_warning "Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing Vercel CLI..."
    npm install -g vercel
fi

print_success "All prerequisites are installed!"

# Install dependencies
print_step "Installing dependencies..."
bun install
print_success "Dependencies installed!"

# Build the application
print_step "Building the application..."
if bun run build; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Please check the errors above."
    exit 1
fi

# Check if user is logged into Vercel
print_step "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "You are not logged into Vercel. Please log in..."
    vercel login
fi

print_success "Vercel authentication confirmed!"

# Deploy to Vercel
print_step "Deploying to Vercel..."
echo ""
echo -e "${YELLOW}🔧 You will need to configure environment variables in Vercel:${NC}"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - ENCRYPTION_KEY"
echo "   - SMTP_USER"
echo "   - SMTP_PASS"
echo "   - NEXT_PUBLIC_GOOGLE_ANALYTICS_ID (optional)"
echo "   - SENTRY_DSN (optional)"
echo ""

read -p "Press Enter to continue with deployment..."

# Deploy to production
if vercel --prod; then
    print_success "Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}🎉 Your Indian Consular Services portal is now live!${NC}"
    echo ""

    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep -E "indian-consular-services.*Ready" | head -1 | awk '{print $2}')

    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo -e "${BLUE}🌐 Live URLs:${NC}"
        echo "   Main Site: https://$DEPLOYMENT_URL"
        echo "   Admin Panel: https://$DEPLOYMENT_URL/admin"
        echo "   Services: https://$DEPLOYMENT_URL/services"
        echo ""
        echo -e "${YELLOW}🔑 Demo Credentials:${NC}"
        echo "   Username: officer123"
        echo "   Password: demo2025"
        echo ""
    fi

    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "   1. Configure environment variables in Vercel dashboard"
    echo "   2. Set up custom domain (optional)"
    echo "   3. Configure MongoDB Atlas database"
    echo "   4. Set up Google Analytics and Sentry"
    echo "   5. Test all functionality"
    echo ""
    echo -e "${GREEN}🔗 Vercel Dashboard: https://vercel.com/dashboard${NC}"

else
    print_error "Deployment failed! Please check the errors above."
    exit 1
fi

# Optional: Open browser
read -p "Would you like to open the deployed site in your browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://$DEPLOYMENT_URL"
        elif command -v open &> /dev/null; then
            open "https://$DEPLOYMENT_URL"
        else
            echo "Please open https://$DEPLOYMENT_URL in your browser"
        fi
    fi
fi

print_success "Deployment script completed!"
echo ""
echo -e "${BLUE}📚 For detailed documentation, see:${NC}"
echo "   - User Guide: docs/USER_GUIDE.md"
echo "   - Admin Manual: docs/ADMIN_MANUAL.md"
echo "   - Production Guide: docs/PRODUCTION_DEPLOYMENT.md"
echo ""
echo -e "${GREEN}Thank you for using Indian Consular Services! 🇮🇳${NC}"
