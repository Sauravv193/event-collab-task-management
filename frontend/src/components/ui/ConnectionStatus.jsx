import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Button from './Button';

const ConnectionStatus = ({ showDetails = false, className = '' }) => {
  const { connectionStatus, isConnected, onlineUsers, reconnect } = useSocket();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          message: 'Connected',
          description: 'Real-time updates active'
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          message: 'Connecting...',
          description: 'Establishing real-time connection'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          message: 'Connection Error',
          description: 'Unable to connect to real-time updates'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          message: 'Offline',
          description: 'No real-time connection'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  if (!showDetails) {
    // Compact status indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          animate={{ rotate: connectionStatus === 'connecting' ? 360 : 0 }}
          transition={{ duration: 1, repeat: connectionStatus === 'connecting' ? Infinity : 0 }}
        >
          <Icon className={`w-4 h-4 ${statusConfig.color}`} />
        </motion.div>
        <span className={`text-sm ${statusConfig.color}`}>
          {statusConfig.message}
        </span>
      </div>
    );
  }

  // Detailed status card
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-lg border 
        ${statusConfig.bgColor} 
        ${statusConfig.borderColor} 
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: connectionStatus === 'connecting' ? 360 : 0,
              scale: connectionStatus === 'connected' ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              duration: connectionStatus === 'connecting' ? 1 : 0.5,
              repeat: connectionStatus === 'connecting' ? Infinity : 0
            }}
          >
            <Icon className={`w-5 h-5 ${statusConfig.color}`} />
          </motion.div>
          <div>
            <h3 className={`font-medium ${statusConfig.color}`}>
              {statusConfig.message}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {connectionStatus === 'error' && (
          <Button
            size="sm"
            variant="outline"
            onClick={reconnect}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>

      {/* Online users count */}
      <AnimatePresence>
        {isConnected && onlineUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {onlineUsers.slice(0, 3).map((username, index) => (
                  <div
                    key={username}
                    className="w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-medium"
                    title={username}
                    style={{ zIndex: onlineUsers.length - index }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-medium">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Typing indicator component
export const TypingIndicator = ({ eventId, className = '' }) => {
  const { getTypingUsers } = useSocket();
  const typingUsers = getTypingUsers(eventId);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span>{getTypingText()}</span>
    </motion.div>
  );
};

// Online status badge for users
export const OnlineStatusBadge = ({ username, size = 'sm' }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(username);

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isOnline ? '#10b981' : '#6b7280',
          scale: isOnline ? [1, 1.2, 1] : 1
        }}
        transition={{ duration: 0.3 }}
        className={`
          ${sizeClasses[size]} 
          rounded-full border-2 border-white dark:border-gray-800
          absolute -bottom-0.5 -right-0.5
        `}
        title={isOnline ? 'Online' : 'Offline'}
      />
    </div>
  );
};

export default ConnectionStatus;