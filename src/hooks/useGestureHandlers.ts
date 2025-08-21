import { useRef, useCallback, useState } from 'react';
import { Animated } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { TouchPosition, WebSocketMessage } from '../types';
import { MOVEMENT_SENSITIVITY, THROTTLE_MS } from '../constants/config';

interface UseGestureHandlersProps {
  sendMessage: (message: WebSocketMessage) => void;
  addTrailPoint: (x: number, y: number) => void;
}

export const useGestureHandlers = ({ sendMessage, addTrailPoint }: UseGestureHandlersProps) => {
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastSentTime = useRef(0);
  const [currentTouch, setCurrentTouch] = useState<TouchPosition | null>(null);
  const touchOpacity = useRef(new Animated.Value(0)).current;

  const sendMovement = useCallback((dx: number, dy: number) => {
    console.log(`Sending movement: dx=${dx}, dy=${dy}`);
    const now = Date.now();
    if (now - lastSentTime.current < THROTTLE_MS) {
      return;
    }

    sendMessage({
      type: "move",
      dx: Math.round(dx * MOVEMENT_SENSITIVITY),
      dy: Math.round(dy * MOVEMENT_SENSITIVITY),
    });
    lastSentTime.current = now;
  }, [sendMessage]);

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
    sendMessage({
      type: "click",
      button: "left"
    });
  }, [sendMessage]);

  const handleDoubleTap = useCallback(() => {
    console.log("Double tap");
    sendMessage({
      type: "click",
      button: "right"
    });
  }, [sendMessage]);

  return {
    currentTouch,
    touchOpacity,
    handlePan,
    handleSingleTap,
    handleDoubleTap
  };
};
