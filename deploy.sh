#!/bin/bash

# Deployment script for Octra Web Wallet
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment of Octra Web Wallet..."

# Configuration
APP_NAME="octra-wallet"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/octra-wallet"
NGINX_CONFIG="/etc/nginx/sites-available/octra-wallet"
BACKUP_DIR="/var/backups/octra-wallet"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Make sure this is intended."
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Build the application
print_status "Building application..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build failed. $BUILD_DIR directory not found."
    exit 1
fi

# Create backup of current deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    print_status "Creating backup of current deployment..."
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
fi

# Create deployment directory
print_status "Creating deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"

# Copy built files to deployment directory
print_status "Copying files to deployment directory..."
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Set proper permissions
print_status "Setting file permissions..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

# Copy nginx configuration if it doesn't exist
if [ ! -f "$NGINX_CONFIG" ]; then
    print_status "Installing nginx configuration..."
    sudo cp nginx.conf "$NGINX_CONFIG"
    
    print_warning "Please edit $NGINX_CONFIG to configure your domain and SSL certificates"
    print_warning "Then run: sudo ln -s $NGINX_CONFIG /etc/nginx/sites-enabled/"
    print_warning "And: sudo nginx -t && sudo systemctl reload nginx"
else
    print_status "Nginx configuration already exists at $NGINX_CONFIG"
fi

# Test nginx configuration
if command -v nginx &> /dev/null; then
    print_status "Testing nginx configuration..."
    if sudo nginx -t; then
        print_status "Nginx configuration is valid"
        
        # Ask if user wants to reload nginx
        read -p "Do you want to reload nginx now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo systemctl reload nginx
            print_status "Nginx reloaded successfully"
        fi
    else
        print_error "Nginx configuration test failed"
    fi
else
    print_warning "Nginx not found. Please install nginx and configure manually."
fi

print_status "Deployment completed successfully!"
print_status "Application deployed to: $DEPLOY_DIR"

echo
echo "📋 Next steps:"
echo "1. Configure your domain in $NGINX_CONFIG"
echo "2. Set up SSL certificates (Let's Encrypt recommended)"
echo "3. Enable the nginx site: sudo ln -s $NGINX_CONFIG /etc/nginx/sites-enabled/"
echo "4. Test and reload nginx: sudo nginx -t && sudo systemctl reload nginx"
echo "5. The app will automatically handle RPC CORS issues through fallback proxy"
echo
echo "🌐 Your Octra Web Wallet will be available at your configured domain"