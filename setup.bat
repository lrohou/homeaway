@echo off
REM Home Away - Project Setup Script for Windows
REM This script helps set up both frontend and backend for local development

echo.
echo 🌍 Home Away - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js is installed: %NODE_VERSION%
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm is installed: %NPM_VERSION%
echo.

REM Frontend Setup
echo 📦 Installing Frontend Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Backend Setup
echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Environment Configuration
echo 🔧 Environment Configuration
echo.

REM Backend .env
if not exist "backend\.env" (
    echo Creating backend\.env...
    copy backend\.env.example backend\.env
    echo ✅ backend\.env created. Please edit with your database credentials.
) else (
    echo ✅ backend\.env already exists
)

REM Frontend .env.local
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo VITE_API_URL=http://localhost:5000/api
        echo VITE_APP_NAME=Home Away
    ) > .env.local
    echo ✅ .env.local created
) else (
    echo ✅ .env.local already exists
)

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo.
echo 1. 📝 Configure your database:
echo    - Edit 'backend\.env' with your MySQL credentials
echo    - Create the database in MySQL (name: homeaway^)
echo.
echo 2. 🚀 Start the backend:
echo    cd backend ^& npm run dev
echo.
echo 3. 🚀 Start the frontend (in a new terminal^):
echo    npm run dev
echo.
echo 4. 💻 Open your browser:
echo    http://localhost:5173
echo.
echo 5. 🔐 Create an account:
echo    Click 'Sign up' and fill in the registration form
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE.md
echo.
pause
