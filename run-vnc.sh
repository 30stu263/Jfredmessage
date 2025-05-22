#!/bin/bash

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

# Create a simple desktop shortcut for our application
mkdir -p ~/Desktop
cat > ~/Desktop/CloudMessenger.desktop << EOF
[Desktop Entry]
Type=Application
Name=Cloud Messenger
Exec=firefox http://localhost:5000
Icon=web-browser
Terminal=false
EOF
chmod +x ~/Desktop/CloudMessenger.desktop

# Open browser with our app
firefox http://localhost:5000 &

# Keep the script running
echo "VNC server running on port 5901"
echo "Use a VNC client to connect to the VNC desktop"
echo "The Cloud Messenger application will open automatically"
echo "Press Ctrl+C to stop the VNC server"

# Wait for user to press Ctrl+C
trap "vncserver -kill :1; exit" INT
while true; do
  sleep 1
done