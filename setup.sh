#!/bin/bash

# Portfolio Development Environment Setup Script
# This script sets up the Ram ML Engineer Portfolio for development

set -e

echo "🚀 Setting up Ram's ML Engineer Portfolio..."
echo "=============================================="

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run build
echo ""
echo "🏗️  Building the project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
