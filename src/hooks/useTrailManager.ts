import { useState, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { TrailPoint } from '../types';
import { MAX_TRAIL_POINTS, TRAIL_FADE_DURATION } from '../constants/config';

export const useTrailManager = () => {
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);

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

  return {
    trailPoints,
    addTrailPoint,
    createTrailPath
  };
};
