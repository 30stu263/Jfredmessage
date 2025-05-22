#!/bin/bash

# Kill any existing VNC servers
pkill -f Xvnc || true
pkill -f x11vnc || true
pkill -f fluxbox || true

# Set VNC password
mkdir -p ~/.vnc
echo "password" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Start VNC server
vncserver :1 -geometry 1280x800 -depth 24 &
sleep 2

# Set DISPLAY variable
export DISPLAY=:1

# Start window manager
fluxbox &
sleep 2

# Start the browser with our app
DISPLAY=:1 xterm -e "echo 'Cloud Messenger application is running. Please access it through your browser at http://localhost:5000'; read" &

# Start our application server
npm run dev