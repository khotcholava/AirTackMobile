import { useRef, useEffect, useState, useCallback } from 'react';
import { AIRTRACK_WS_URL, THROTTLE_MS } from '../constants/config';
import { WebSocketMessage } from '../types';

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastSentTime = useRef(0);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(AIRTRACK_WS_URL);

        ws.current.onopen = () => {
          console.log("Connected to AirTrack");
          setIsConnected(true);
        };

        ws.current.onmessage = (msg) => {
          console.log(`Data received: ${msg.data}`);
        };

        ws.current.onclose = () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
          // Auto-reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
        setIsConnected(false);
      }
    };
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    // Apply throttling for movement messages
    if (message.type === 'move') {
      const now = Date.now();
      if (now - lastSentTime.current < THROTTLE_MS) {
        return;
      }
      lastSentTime.current = now;
    }

    try {
      ws.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }, []);

  return { sendMessage, isConnected };
};
