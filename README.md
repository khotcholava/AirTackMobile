# AirTrack Client

A beautiful and responsive React Native trackpad client for the AirTrack wireless mouse and keyboard system. Transform your mobile device into a professional trackpad with advanced gesture support, visual feedback, and smooth scrolling.

## ✨ Features

### 🖱️ **Advanced Trackpad Functionality**
- **Single-finger cursor control** with precise movement tracking
- **Two-finger scrolling** with momentum and natural deceleration
- **Tap gestures**: Single tap (left click) and double tap (right click)
- **Visual feedback** with beautiful animated trails and touch indicators

### 🎨 **Modern UI/UX**
- **Gradient background** with customizable color schemes
- **Real-time gesture visualization** with smooth animated trails
- **Touch point indicators** with elegant animations
- **Responsive design** optimized for all screen sizes

### ⚡ **Performance Optimized**
- **60fps gesture tracking** with optimized throttling
- **Memory efficient** with automatic cleanup of visual elements
- **Low latency** WebSocket communication
- **Smooth animations** using native drivers

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Expo CLI
- React Native development environment
- AirTrack server running on your computer

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AirTrackClient.git
   cd AirTrackClient
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure server connection**
   
   Edit the WebSocket URL in `App.tsx`:
   ```tsx
   const AIRTRACK_WS_URL = "ws://YOUR_COMPUTER_IP:9002";
   ```
   
   Replace `YOUR_COMPUTER_IP` with your computer's IP address.

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or run on simulator: `npx expo start --ios` / `npx expo start --android`

## 🎮 Usage

### Basic Controls

| Gesture | Action |
|---------|--------|
| **Single finger drag** | Move cursor |
| **Two finger scroll** | Scroll content with momentum |
| **Single tap** | Left mouse click |
| **Double tap** | Right mouse click |

### Visual Feedback

- **Touch trails**: Beautiful animated lines follow your finger movement
- **Touch indicators**: Elegant circles show current touch position
- **Gradient background**: Modern visual design
- **Smooth animations**: All interactions include smooth transitions

## 🔧 Configuration

### Sensitivity Settings

Adjust these constants in `App.tsx` to customize behavior:

```tsx
const MOVEMENT_SENSITIVITY = 2;        // Cursor movement speed
const SCROLL_SENSITIVITY = 0.5;        // Scroll speed
const MOMENTUM_DECAY = 0.95;           // Scroll momentum decay rate
const MIN_MOMENTUM_VELOCITY = 0.1;     // When to stop momentum scrolling
```

### Visual Customization

#### Background Gradient
```tsx
// In the LinearGradient component
colors={['#667eea', '#764ba2']}  // Purple-blue gradient

// Alternative color schemes:
colors={['#4facfe', '#00f2fe']}  // Modern blue
colors={['#fa709a', '#fee140']}  // Sunset orange
colors={['#56ab2f', '#a8e6cf']}  // Green nature
```

#### Trail Settings
```tsx
const MAX_TRAIL_POINTS = 20;           // Number of trail points
const TRAIL_FADE_DURATION = 2000;      // Trail fade time (ms)
```

## 🏗️ Architecture

### Core Components

- **App.tsx**: Main application component with gesture handling
- **WebSocket Communication**: Real-time connection to AirTrack server
- **Gesture Recognition**: Advanced multi-touch gesture detection
- **Visual Effects**: SVG-based trails and animations

### Message Protocol

The client communicates with the AirTrack server using JSON messages:

#### Cursor Movement
```json
{
  "type": "move",
  "dx": 5,
  "dy": -3
}
```

#### Scroll Events
```json
{
  "type": "scroll", 
  "scroll_x": 0,
  "scroll_y": -3
}
```

#### Click Events
```json
{
  "type": "click",
  "button": "left"  // or "right"
}
```

## 🛠️ Development

### Project Structure
```
AirTrackClient/
├── App.tsx              # Main application component
├── package.json          # Dependencies and scripts
├── app.json             # Expo configuration
├── assets/              # Images and icons
└── README.md            # This file
```

### Key Dependencies

- **expo**: React Native framework
- **react-native-gesture-handler**: Advanced gesture recognition
- **react-native-svg**: Vector graphics for visual effects
- **expo-linear-gradient**: Gradient backgrounds

### Building for Production

1. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

2. **Build for Android**
   ```bash
   npx expo build:android
   ```

## 🔧 Troubleshooting

### Common Issues

**Connection Problems**
- Ensure your device and computer are on the same network
- Check firewall settings on your computer
- Verify the IP address in `AIRTRACK_WS_URL`

**Performance Issues**
- Reduce `MAX_TRAIL_POINTS` for older devices
- Increase throttling values for slower networks
- Disable visual effects if needed

**Gesture Recognition**
- Ensure `react-native-gesture-handler` is properly installed
- Check that gesture handlers are properly nested
- Verify touch events are not blocked by other components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Compatibility

- **iOS**: 11.0+
- **Android**: API 21+ (Android 5.0)
- **Expo SDK**: 53.0+
- **React Native**: 0.79+

## 🎯 Roadmap

- [ ] **Multi-device support**: Connect to multiple computers
- [ ] **Gesture customization**: User-defined gesture mappings
- [ ] **Haptic feedback**: Tactile response for interactions
- [ ] **Dark/Light themes**: Multiple visual themes
- [ ] **Keyboard support**: Virtual keyboard functionality
- [ ] **Settings panel**: In-app configuration options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Gesture handling powered by [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- Visual effects using [react-native-svg](https://github.com/react-native-svg/react-native-svg)

---

**Made with ❤️ for seamless wireless control**