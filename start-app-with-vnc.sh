#!/bin/bash

# Start our application in the background
npm run dev &
APP_PID=$!

# Wait for app to start
echo "Starting Cloud Messenger application..."
sleep 5

# Kill any existing VNC servers
pkill -f Xvnc || true
pkill -f x11vnc || true
pkill -f fluxbox || true

# Create VNC directory if it doesn't exist
mkdir -p ~/.vnc

# Set VNC password
echo "password" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Start VNC server
vncserver :1 -geometry 1366x768 -depth 24 -localhost no

# Set DISPLAY variable
export DISPLAY=:1

# Start window manager
fluxbox &

# Wait for window manager to start
sleep 2

# Start a terminal with instructions
xterm -geometry 80x15+0+0 -e "echo 'Cloud Messenger VNC Environment'; echo ''; echo 'Access your application at http://localhost:5000'; echo ''; echo 'Press Ctrl+C in this terminal to exit.'; bash" &

# Start Firefox with our app (if Firefox is available)
if command -v firefox &> /dev/null; then
    firefox http://localhost:5000 &
fi

echo ""
echo "==== Cloud Messenger Application with VNC ====="
echo ""
echo "The application is running at http://localhost:5000"
echo "VNC server is running on port 5901"
echo ""
echo "To connect to VNC:"
echo "1. Use a VNC viewer to connect to this Replit instance on port 5901"
echo "2. Use password: password"
echo ""
echo "To use the application directly:"
echo "1. Open http://localhost:5000 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"

# Function to clean up on exit
function cleanup {
    echo "Shutting down..."
    kill $APP_PID || true
    vncserver -kill :1 || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup INT TERM

# Keep the script running
wait $APP_PID