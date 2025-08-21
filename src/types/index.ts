import { Animated } from 'react-native';

export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity: Animated.Value;
}

export interface TouchPosition {
  x: number;
  y: number;
}

// WebSocket Messages (for all communication in Expo)
export interface MovementMessage {
  type: "move";
  dx: number;
  dy: number;
}

export interface ScrollMessage {
  type: "scroll";
  scroll_x: number;
  scroll_y: number;
}

export interface ClickMessage {
  type: "click";
  button: "left" | "right";
}

export type WebSocketMessage = MovementMessage | ScrollMessage | ClickMessage;

// Keep UDP types for potential future use
export interface UDPMovementMessage {
  type: "move";
  dx: number;
  dy: number;
}

export interface UDPScrollMessage {
  type: "scroll";
  scroll_x: number;
  scroll_y: number;
}

export type UDPMessage = UDPMovementMessage | UDPScrollMessage;
