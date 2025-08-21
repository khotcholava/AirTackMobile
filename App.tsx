import { StatusBar } from 'expo-status-bar';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useEffect, useRef, useCallback} from "react";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

const AIRTRACK_WS_URL = "ws://192.168.0.101:9002";
const MOVEMENT_SENSITIVITY = 2; // Adjust sensitivity
const THROTTLE_MS = 16; // ~60fps throttling

export default function App() {
  const ws = useRef<WebSocket | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastSentTime = useRef(0);

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
  }, []); // Fixed dependency array

  const sendMovement = useCallback((dx: number, dy: number) => {
    const now = Date.now();
    if (now - lastSentTime.current < THROTTLE_MS) {
      return; // Throttle messages
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
      // Reset position on gesture start
      lastPosition.current = { x: absoluteX, y: absoluteY };
      return;
    }
    
    if (state === State.ACTIVE) {
      // Calculate delta movement
      const dx = absoluteX - lastPosition.current.x;
      const dy = absoluteY - lastPosition.current.y;
      
      // Only send if there's meaningful movement
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        sendMovement(dx, dy);
        lastPosition.current = { x: absoluteX, y: absoluteY };
      }
    }
  }, [sendMovement]);

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
            <View style={styles.trackpad} />
          </PanGestureHandler>
        </TapGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  trackpad: {
    flex: 1,
    backgroundColor: "#111",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});