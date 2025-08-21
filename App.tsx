import { StatusBar } from 'expo-status-bar';
import {Dimensions, StyleSheet, Text, View, Animated} from 'react-native';
import {useEffect, useRef, useCallback, useState} from "react";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

const AIRTRACK_WS_URL = "ws://192.168.0.101:9002";
const MOVEMENT_SENSITIVITY = 2;
const THROTTLE_MS = 16;
const MAX_TRAIL_POINTS = 20; // Number of trail points to keep
const TRAIL_FADE_DURATION = 2000; // Trail fade duration in ms

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity: Animated.Value;
}

export default function App() {
  const ws = useRef<WebSocket | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastSentTime = useRef(0);
  const [currentTouch, setCurrentTouch] = useState<{x: number, y: number} | null>(null);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const touchOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(AIRTRACK_WS_URL);

      ws.current.onopen = () => {
        console.log("Connected to AirTrack");
      };

      ws.current.onmessage = (msg) => {
        console.log(`Data received: ${msg.data}`);
      };

      ws.current.onclose = () => {
        console.log("WebSocket connection closed");
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, []);

  // Clean up old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTrailPoints(prev => prev.filter(point => now - point.timestamp < TRAIL_FADE_DURATION));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const addTrailPoint = useCallback((x: number, y: number) => {
    const newPoint: TrailPoint = {
      x,
      y,
      timestamp: Date.now(),
      opacity: new Animated.Value(1)
    };

    // Animate opacity to 0
    Animated.timing(newPoint.opacity, {
      toValue: 0,
      duration: TRAIL_FADE_DURATION,
      useNativeDriver: true,
    }).start();

    setTrailPoints(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-MAX_TRAIL_POINTS); // Keep only last N points
    });
  }, []);

  const sendMovement = useCallback((dx: number, dy: number) => {
    const now = Date.now();
    if (now - lastSentTime.current < THROTTLE_MS) {
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "move",
          dx: Math.round(dx * MOVEMENT_SENSITIVITY),
          dy: Math.round(dy * MOVEMENT_SENSITIVITY),
        })
      );
      lastSentTime.current = now;
    }
  }, []);

  const handlePan = useCallback((event: any) => {
    const { absoluteX, absoluteY, state } = event.nativeEvent;

    if (state === State.BEGAN) {
      lastPosition.current = { x: absoluteX, y: absoluteY };
      setCurrentTouch({ x: absoluteX, y: absoluteY });
      addTrailPoint(absoluteX, absoluteY);

      // Animate touch point appearance
      Animated.timing(touchOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (state === State.ACTIVE) {
      const dx = absoluteX - lastPosition.current.x;
      const dy = absoluteY - lastPosition.current.y;

      setCurrentTouch({ x: absoluteX, y: absoluteY });
      addTrailPoint(absoluteX, absoluteY);

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        sendMovement(dx, dy);
        lastPosition.current = { x: absoluteX, y: absoluteY };
      }
    }

    if (state === State.END || state === State.CANCELLED) {
      // Animate touch point disappearance
      Animated.timing(touchOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentTouch(null);
      });
    }
  }, [sendMovement, addTrailPoint, touchOpacity]);

  const handleSingleTap = useCallback(() => {
    if(ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "click",
          button: "left"
        })
      );
    }
  }, []);

  const handleDoubleTap = useCallback(() => {
    if(ws.current?.readyState === WebSocket.OPEN) {
      console.log("Double tap");
      ws.current.send(
        JSON.stringify({
          type: "click",
          button: "right"
        })
      );
    }
  }, []);

  // Create SVG path from trail points
  const createTrailPath = useCallback(() => {
    if (trailPoints.length < 2) return '';

    let path = `M ${trailPoints[0].x} ${trailPoints[0].y}`;
    for (let i = 1; i < trailPoints.length; i++) {
      const point = trailPoints[i];
      const prevPoint = trailPoints[i - 1];
      const cpx = (prevPoint.x + point.x) / 2;
      const cpy = (prevPoint.y + point.y) / 2;
      path += ` Q ${prevPoint.x} ${prevPoint.y} ${cpx} ${cpy}`;
    }
    return path;
  }, [trailPoints]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TapGestureHandler
        onActivated={handleSingleTap}
        numberOfTaps={1}
        waitFor="doubleTap"
      >
        <TapGestureHandler id="doubleTap" onActivated={handleDoubleTap} numberOfTaps={2}>
          <PanGestureHandler
            onGestureEvent={handlePan}
            onHandlerStateChange={handlePan}
            minDist={1}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackpad}
            >
              {/* SVG Overlay for trails and touch points */}
              <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
                {/* Render trail path */}
                {trailPoints.length > 1 && (
                  <Path
                    d={createTrailPath()}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Render individual trail points */}
                {trailPoints.map((point, index) => (
                  <Circle
                    key={`${point.timestamp}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill="rgba(255, 255, 255, 0.8)"
                  />
                ))}
              </Svg>

              {/* Current touch point */}
              {currentTouch && (
                <Animated.View
                  style={[
                    styles.touchPoint,
                    {
                      left: currentTouch.x - 25,
                      top: currentTouch.y - 25,
                      opacity: touchOpacity,
                    }
                  ]}
                >
                  <View style={styles.touchPointInner} />
                  <View style={styles.touchPointRing} />
                </Animated.View>
              )}
            </LinearGradient>
          </PanGestureHandler>
        </TapGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  trackpad: {
    flex: 1,
  },
  touchPoint: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchPointInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  touchPointRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});