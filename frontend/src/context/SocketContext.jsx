import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      
      // The backend STOMP endpoint is '/ws'
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          // The interceptor expects an 'Authorization' header for authentication
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
      });

      client.onConnect = (frame) => {
        console.log('STOMP Connected: ' + frame);
        setStompClient(client);
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      client.activate();

      return () => {
        if (client && client.connected) {
          client.deactivate();
        }
      };
    } else if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ stompClient }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);