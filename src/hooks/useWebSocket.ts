import { useRef, useEffect } from 'react';
import { AIRTRACK_WS_URL } from '../constants/config';
import { WebSocketMessage } from '../types';

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);

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

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
