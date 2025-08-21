import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";

import { useWebSocket } from './src/hooks/useWebSocket';
import { useTrailManager } from './src/hooks/useTrailManager';
import { useGestureHandlers } from './src/hooks/useGestureHandlers';
import { TrailOverlay } from './src/components/TrailOverlay';
import { TouchPoint } from './src/components/TouchPoint';
import { trackpadStyles } from './src/styles/trackpadStyles';

export default function App() {
  const { sendMessage } = useWebSocket();
  const { trailPoints, addTrailPoint, createTrailPath } = useTrailManager();
  const {
    currentTouch,
    touchOpacity,
    handlePan,
    handleSingleTap,
    handleDoubleTap
  } = useGestureHandlers({ sendMessage, addTrailPoint });

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
              style={trackpadStyles.trackpad}
            >
              <TrailOverlay 
                trailPoints={trailPoints} 
                createTrailPath={createTrailPath} 
              />
              
              <TouchPoint 
                currentTouch={currentTouch} 
                touchOpacity={touchOpacity} 
              />
            </LinearGradient>
          </PanGestureHandler>
        </TapGestureHandler>
      </TapGestureHandler>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}