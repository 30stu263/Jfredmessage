#!/bin/bash

# Stop the running workflow first to avoid port conflicts
echo "Stopping any running application..."
pkill -f "tsx server/index.ts" || true
sleep 2

# Kill any existing VNC servers
echo "Cleaning up any existing VNC sessions..."
pkill -f Xvnc || true
pkill -f x11vnc || true
pkill -f fluxbox || true
sleep 1

# Create VNC directory if it doesn't exist
mkdir -p ~/.vnc

# Set VNC password
echo "Setting up VNC with password: cloudmsg"
echo "cloudmsg" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Start VNC server
echo "Starting VNC server..."
vncserver :1 -geometry 1366x768 -depth 24 -localhost no

# Set DISPLAY variable
export DISPLAY=:1

# Start window manager
echo "Starting window manager..."
fluxbox &
sleep 2

# Start our application in the background
echo "Starting Cloud Messenger application..."
NODE_ENV=development tsx server/index.ts &
APP_PID=$!

# Wait for app to start
sleep 3

# Start Firefox with our app
echo "Opening application in browser..."
firefox http://localhost:5000 &

echo ""
echo "================ CLOUD MESSENGER VNC ================"
echo ""
echo "Your messenger application is now running in a VNC environment!"
echo ""
echo "To access the VNC desktop:"
echo "1. Use a VNC viewer (like VNC Viewer, TightVNC, or RealVNC)"
echo "2. Connect to this Replit on port 5901"
echo "3. Password: cloudmsg"
echo ""
echo "The Cloud Messenger app should open automatically in Firefox"
echo "If not, you can access it at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server and VNC session"
echo "=================================================="

# Function to clean up on exit
function cleanup {
    echo "Shutting down services..."
    kill $APP_PID 2>/dev/null || true
    vncserver -kill :1 2>/dev/null || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup INT TERM

# Keep the script running
wait $APP_PID