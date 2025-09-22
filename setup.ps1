# Setup script for Bank Customer Segmentation Project
Write-Host "Setting up Bank Customer Segmentation Project..."

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion is installed"
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
}

# Check if MongoDB is installed
try {
    $mongodVersion = mongod --version
    Write-Host "MongoDB is installed"
    
    # Try to start MongoDB service
    try {
        Start-Service MongoDB -ErrorAction Stop
        Write-Host "MongoDB service started successfully"
    } catch {
        Write-Host "Could not start MongoDB service. Please make sure MongoDB is installed and try starting it manually."
        Write-Host "You can download MongoDB from: https://www.mongodb.com/try/download/community"
        exit 1
    }
} catch {
    Write-Host "MongoDB is not installed or not in PATH. Please install MongoDB from: https://www.mongodb.com/try/download/community"
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..."
Set-Location backend
npm install

# Install http-server globally if not already installed
if (-not (Get-Command http-server -ErrorAction SilentlyContinue)) {
    Write-Host "Installing http-server globally..."
    npm install -g http-server
}

Set-Location ..
Write-Host ""
Write-Host "Setup completed successfully!"
Write-Host ""
Write-Host "To start the application, run:"
Write-Host "1. Start MongoDB (if not already running): net start MongoDB"
Write-Host "2. In a new terminal, start the backend: cd backend && npm run dev"
Write-Host "3. In another terminal, start the frontend: http-server -p 3000"
Write-Host "4. Open your browser and visit: http://localhost:3000"
