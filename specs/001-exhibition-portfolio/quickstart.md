# Quickstart: Phase 2 "WOW" Features Validation

## Prerequisites
- Node.js 18+
- Audio output enabled on your machine/device.
- For Gyroscope testing: A physical mobile device (iOS/Android) with motion sensors.

## Run Commands
```bash
npm install
npm run dev
```

## Validation Scenarios

### 1. Enter Overlay & Audio Permission
- Navigate to `http://localhost:3000`.
- Verify a black overlay appears with an "Enter" button.
- Click "Enter".
- Verify ambient sound starts playing.
- Scroll down rapidly. Verify the pitch and volume of the sound increase dynamically with your scroll velocity.

### 2. WebGL Cursor Magnet
- On Desktop, move your mouse over the screen.
- Verify a WebGL distortion effect follows your cursor.
- Hover over an artwork/section. Verify the cursor "snaps" or magnets to the target and a CD (Cooldown) ring appears.

### 3. Deep Linking Curtains
- Navigate directly to `http://localhost:3000/#work-b`.
- Verify the "Enter" overlay appears (if it's the first visit).
- Click "Enter".
- Verify the Sprite Intro plays briefly, followed by a "Curtains opening" split-screen transition revealing `#work-b`.

### 4. Mobile Gyroscope Parallax
- Open `http://localhost:3000` on a mobile device (using your local IP address).
- Click "Enter". (On iOS, approve the Motion Sensor prompt).
- Tilt your phone left/right and up/down.
- Verify the background/foreground parallax layers shift in 2.5D space responding to your tilt.
