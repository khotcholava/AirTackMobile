import { StatusBar } from 'expo-status-bar';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useEffect, useRef} from "react";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";

const AIRTRACK_WS_URL = "ws://192.168.0.101:9002";

export default function App() {
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket(AIRTRACK_WS_URL);

    ws.current.onopen = () => {
      console.log("Connected to AirTrack");
    };

    ws.current.onmessage = (msg) => {
      console.log(`Date received: ${msg.data}`);
    }

    return () => {
      ws.current?.close();
    }
  })


  const handlePan = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "move",
          dx: Math.round(translationX),
          dy: Math.round(translationY),
        })
      );
    }
  };

  const handleSingleTap = () => {
    if(ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "click",
          button: "left"
        })
      )
    }
  }
  const handleDoubleTap = () => {
    if(ws.current?.readyState === WebSocket.OPEN) {
      console.log("Double tap");
      ws.current.send(
        JSON.stringify({
          type: "click",
          button: "right"
        })
      )
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TapGestureHandler
        onActivated={handleSingleTap}
        numberOfTaps={1}
        waitFor="doubleTap"
      >
        <TapGestureHandler id="doubleTap" onActivated={handleDoubleTap} numberOfTaps={2}>
          <PanGestureHandler onGestureEvent={handlePan}>
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