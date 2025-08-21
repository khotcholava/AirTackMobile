import React from 'react';
import { View, Animated } from 'react-native';
import { TouchPosition } from '../types';
import { trackpadStyles } from '../styles/trackpadStyles';

interface TouchPointProps {
  currentTouch: TouchPosition | null;
  touchOpacity: Animated.Value;
}

export const TouchPoint: React.FC<TouchPointProps> = ({ currentTouch, touchOpacity }) => {
  if (!currentTouch) return null;

  return (
    <Animated.View
      style={[
        trackpadStyles.touchPoint,
        {
          left: currentTouch.x - 25,
          top: currentTouch.y - 25,
          opacity: touchOpacity,
        }
      ]}
    >
      <View style={trackpadStyles.touchPointInner} />
      <View style={trackpadStyles.touchPointRing} />
    </Animated.View>
  );
};
