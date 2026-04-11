#!/bin/bash

# Home Away - Project Setup Script
# This script helps set up both frontend and backend for local development

set -e  # Exit on error

echo "🌍 Home Away - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Frontend Setup
echo "📦 Installing Frontend Dependencies..."
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Backend Setup
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Environment Configuration
echo "🔧 Environment Configuration"
echo ""

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo "✅ backend/.env created. Please edit with your database credentials."
else
    echo "✅ backend/.env already exists"
fi

# Frontend .env.local
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Home Away
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. 📝 Configure your database:"
echo "   - Edit 'backend/.env' with your MySQL credentials"
echo "   - Create the database: mysql -u root -p < backend/db-init.sql (if available)"
echo ""
echo "2. 🚀 Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. 🚀 Start the frontend (in a new terminal):"
echo "   npm run dev"
echo ""
echo "4. 💻 Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "5. 🔐 Create an account:"
echo "   Click 'Sign up' and fill in the registration form"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
echo ""
