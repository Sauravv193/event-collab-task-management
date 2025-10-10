import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { notify } from '../services/notificationService.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // eventId -> Set of usernames
  const [subscriptions, setSubscriptions] = useState(new Map());
  
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useApp();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const typingTimeouts = useRef(new Map());

  // Enhanced connection management
  const connect = useCallback(() => {
    if (!isAuthenticated || stompClient?.connected) return;
    
    setConnectionStatus('connecting');
    const token = localStorage.getItem('token');
    
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000 * Math.pow(2, reconnectAttempts.current), // Exponential backoff
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP Debug:', str);
        }
      },
    });

    client.onConnect = (frame) => {
      console.log('STOMP Connected:', frame);
      setStompClient(client);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      
      // Subscribe to global notifications
      setupGlobalSubscriptions(client);
      
      // Send user presence
      sendUserPresence(client, 'online');
      
      notify.success('Connected to real-time updates');
    };

    client.onDisconnect = () => {
      console.log('STOMP Disconnected');
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setOnlineUsers(new Set());
      setTypingUsers(new Map());
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Details:', frame.body);
      setConnectionStatus('error');
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        notify.warning(`Connection lost. Retrying... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      } else {
        notify.error('Unable to connect to real-time updates');
      }
    };

    client.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('error');
    };

    client.activate();
    return client;
  }, [isAuthenticated, stompClient]);
  
  // Setup global subscriptions
  const setupGlobalSubscriptions = useCallback((client) => {
    // Global events
    client.subscribe('/topic/events', (message) => {
      const event = JSON.parse(message.body);
      addNotification({
        type: 'event',
        title: 'Event Update',
        message: `Event "${event.name}" has been updated`,
        data: event,
      });
    });
    
    // User presence updates
    client.subscribe('/topic/presence', (message) => {
      const { username, status } = JSON.parse(message.body);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    });
    
    // Global notifications
    client.subscribe('/user/queue/notifications', (message) => {
      const notification = JSON.parse(message.body);
      addNotification(notification);
      notify.info(notification.message);
    });
  }, [addNotification]);
  
  // Send user presence
  const sendUserPresence = useCallback((client, status) => {
    if (client?.connected && user) {
      client.publish({
        destination: '/app/presence',
        body: JSON.stringify({ username: user.username, status })
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else if (stompClient) {
      sendUserPresence(stompClient, 'offline');
      stompClient.deactivate();
      setStompClient(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
    
    return () => {
      if (stompClient?.connected) {
        sendUserPresence(stompClient, 'offline');
        stompClient.deactivate();
      }
    };
  }, [isAuthenticated, connect]);

  // Subscribe to specific topics
  const subscribe = useCallback((destination, callback, headers = {}) => {
    if (!stompClient?.connected) {
      console.warn('Socket not connected. Cannot subscribe to:', destination);
      return null;
    }
    
    const subscription = stompClient.subscribe(destination, callback, headers);
    setSubscriptions(prev => new Map(prev.set(destination, subscription)));
    return subscription;
  }, [stompClient]);
  
  // Unsubscribe from topics
  const unsubscribe = useCallback((destination) => {
    const subscription = subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      setSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(destination);
        return newMap;
      });
    }
  }, [subscriptions]);
  
  // Send message
  const sendMessage = useCallback((destination, body, headers = {}) => {
    if (!stompClient?.connected) {
      console.warn('Socket not connected. Cannot send message to:', destination);
      return false;
    }
    
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
      headers
    });
    return true;
  }, [stompClient]);
  
  // Typing indicators
  const sendTypingStatus = useCallback((eventId, isTyping) => {
    if (!user || !stompClient?.connected) return;
    
    const destination = `/app/events/${eventId}/typing`;
    sendMessage(destination, {
      username: user.username,
      isTyping,
      timestamp: Date.now()
    });
    
    // Clear existing timeout
    const timeoutKey = `${eventId}-${user.username}`;
    if (typingTimeouts.current.has(timeoutKey)) {
      clearTimeout(typingTimeouts.current.get(timeoutKey));
    }
    
    if (isTyping) {
      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        sendTypingStatus(eventId, false);
      }, 3000);
      typingTimeouts.current.set(timeoutKey, timeout);
    } else {
      typingTimeouts.current.delete(timeoutKey);
    }
  }, [user, stompClient, sendMessage]);
  
  // Subscribe to event-specific topics
  const subscribeToEvent = useCallback((eventId) => {
    if (!stompClient?.connected) return null;
    
    const subscriptions = {
      // Tasks updates
      tasks: subscribe(`/topic/events/${eventId}/tasks`, (message) => {
        const taskUpdate = JSON.parse(message.body);
        addNotification({
          type: 'task',
          title: 'Task Updated',
          message: `Task "${taskUpdate.name}" has been ${taskUpdate.status?.toLowerCase()}`,
          data: taskUpdate,
        });
      }),
      
      // Chat messages
      chat: subscribe(`/topic/events/${eventId}/chat`, (message) => {
        const chatMessage = JSON.parse(message.body);
        // Handle chat message (you can emit to chat context)
        addNotification({
          type: 'chat',
          title: 'New Message',
          message: `${chatMessage.sender}: ${chatMessage.content}`,
          data: chatMessage,
        });
      }),
      
      // Typing indicators
      typing: subscribe(`/topic/events/${eventId}/typing`, (message) => {
        const { username, isTyping } = JSON.parse(message.body);
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const eventTyping = newMap.get(eventId) || new Set();
          
          if (isTyping) {
            eventTyping.add(username);
          } else {
            eventTyping.delete(username);
          }
          
          if (eventTyping.size === 0) {
            newMap.delete(eventId);
          } else {
            newMap.set(eventId, eventTyping);
          }
          
          return newMap;
        });
      }),
      
      // Event updates
      event: subscribe(`/topic/events/${eventId}`, (message) => {
        const eventUpdate = JSON.parse(message.body);
        addNotification({
          type: 'event',
          title: 'Event Updated',
          message: `Event details have been updated`,
          data: eventUpdate,
        });
      })
    };
    
    return subscriptions;
  }, [stompClient, subscribe, addNotification]);
  
  // Get typing users for an event
  const getTypingUsers = useCallback((eventId) => {
    return Array.from(typingUsers.get(eventId) || []);
  }, [typingUsers]);
  
  const value = {
    stompClient,
    isConnected,
    connectionStatus,
    onlineUsers: Array.from(onlineUsers),
    connect,
    subscribe,
    unsubscribe,
    sendMessage,
    sendTypingStatus,
    subscribeToEvent,
    getTypingUsers,
    reconnect: () => {
      if (stompClient) {
        stompClient.forceDisconnect();
      }
      connect();
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
