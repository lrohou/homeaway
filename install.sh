#!/bin/bash
# Home Away - Quick Installation & First Run Guide

echo "================================"
echo "🌍 Home Away - Installation Helper"
echo "================================"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Download from: https://nodejs.org/ (LTS version recommended)"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Installation
echo "📦 Installing dependencies..."
npm install --silent
cd backend && npm install --silent && cd ..
echo "✅ Dependencies installed"
echo ""

# Check .env files
echo "🔧 Checking configuration files..."

if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found!"
    echo ""
    echo "📝 Creating backend/.env with default values..."
    cat > backend/.env << 'EOF'
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=homeaway
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Created backend/.env"
    echo "   ⚠️  Edit it with your database credentials!"
else
    echo "✅ backend/.env exists"
fi

if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Home Away
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "⚠️  IMPORTANT: Before running, please:"
echo ""
echo "1️⃣  Create MySQL database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE homeaway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   EXIT;"
echo ""
echo "2️⃣  Edit backend/.env with your MySQL credentials"
echo ""
echo "3️⃣  Start the backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "4️⃣  Start the frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "5️⃣  Open browser:"
echo "   http://localhost:5173"
echo ""
echo "📚 For detailed help, read:"
echo "   - QUICKSTART.md"
echo "   - SETUP_GUIDE.md"
echo "   - backend/README.md"
echo ""
