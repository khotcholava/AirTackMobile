import { useRef, useEffect, useState } from 'react';
import UdpSocket from 'react-native-udp';
import { AIRTRACK_UDP_HOST, AIRTRACK_UDP_PORT } from '../constants/config';
import { UDPMessage } from '../types';

export const useUDP = () => {
  const socket = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastSentTime = useRef(0);

  useEffect(() => {
    // Create UDP socket
    socket.current = UdpSocket.createSocket({ type: 'udp4' });

    socket.current.bind(0, (err: any) => {
      if (err) {
        console.error('UDP bind error:', err);
        setIsConnected(false);
        return;
      }
      console.log('UDP socket bound successfully');
      setIsConnected(true);
    });

    // Handle socket errors
    socket.current.on('error', (err: any) => {
      console.error('UDP socket error:', err);
      setIsConnected(false);
    });

    socket.current.once('listening', () => {
      console.log('UDP socket ready for movement data');
      setIsConnected(true);
    });

    return () => {
      if (socket.current) {
        socket.current.close();
        setIsConnected(false);
      }
    };
  }, []);

  const sendUDPMessage = (message: UDPMessage) => {
    console.log("Message sent:", message);
    if (!socket.current || !isConnected) {
      console.warn('UDP socket not ready');
      return;
    }

    // Throttle messages to avoid overwhelming the network
    const now = Date.now();
    if (message.type === 'move' && now - lastSentTime.current < 8) {
      return; // ~120 FPS max for movement
    }

    const messageString = JSON.stringify(message);
    
    try {
      socket.current.send(
        messageString,
        undefined,
        undefined,
        AIRTRACK_UDP_PORT,
        AIRTRACK_UDP_HOST,
        (err: any) => {
          if (err) {
            console.error('UDP send error:', err);
          }
        }
      );
      lastSentTime.current = now;
    } catch (error) {
      console.error('Failed to send UDP message:', error);
    }
  };

  const reconnect = () => {
    if (socket.current) {
      socket.current.close();
    }
    
    setTimeout(() => {
      socket.current = UdpSocket.createSocket({ type: 'udp4' });
      socket.current.bind(0);
      setIsConnected(true);
    }, 1000);
  };

  return { 
    sendUDPMessage, 
    isConnected, 
    reconnect 
  };
};