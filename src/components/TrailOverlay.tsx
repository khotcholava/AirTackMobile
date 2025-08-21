import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { TrailPoint } from '../types';

interface TrailOverlayProps {
  trailPoints: TrailPoint[];
  createTrailPath: () => string;
}

export const TrailOverlay: React.FC<TrailOverlayProps> = ({ trailPoints, createTrailPath }) => {
  return (
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
  );
};
