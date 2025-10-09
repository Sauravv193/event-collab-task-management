import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { handleApiError, notify } from '../services/notificationService';

// App State
const AppContext = createContext();

// Action types
const AppActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  OPTIMISTIC_UPDATE: 'OPTIMISTIC_UPDATE',
  REVERT_OPTIMISTIC_UPDATE: 'REVERT_OPTIMISTIC_UPDATE'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  isOnline: navigator.onLine,
  notifications: [],
  sidebarOpen: false,
  searchQuery: '',
  filters: {
    category: '',
    date: '',
    status: ''
  },
  optimisticUpdates: new Map()
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case AppActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AppActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case AppActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case AppActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };
    
    case AppActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case AppActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications.slice(0, 49)] // Keep only 50 notifications
      };
    
    case AppActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case AppActionTypes.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload };
    
    case AppActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case AppActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case AppActionTypes.OPTIMISTIC_UPDATE:
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(action.payload.id, action.payload.data);
      return { ...state, optimisticUpdates: newOptimisticUpdates };
    
    case AppActionTypes.REVERT_OPTIMISTIC_UPDATE:
      const revertedOptimisticUpdates = new Map(state.optimisticUpdates);
      revertedOptimisticUpdates.delete(action.payload);
      return { ...state, optimisticUpdates: revertedOptimisticUpdates };
    
    default:
      return state;
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const queryClient = useQueryClient();

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: AppActionTypes.SET_ONLINE_STATUS, payload: true });
      notify.success('Connection restored');
    };
    
    const handleOffline = () => {
      dispatch({ type: AppActionTypes.SET_ONLINE_STATUS, payload: false });
      notify.warning('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actions
  const actions = {
    setLoading: (loading) => {
      dispatch({ type: AppActionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: AppActionTypes.SET_ERROR, payload: error });
      handleApiError(error);
    },

    clearError: () => {
      dispatch({ type: AppActionTypes.CLEAR_ERROR });
    },

    addNotification: (notification) => {
      const notificationWithId = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        read: false,
        ...notification
      };
      dispatch({ type: AppActionTypes.ADD_NOTIFICATION, payload: notificationWithId });
    },

    removeNotification: (id) => {
      dispatch({ type: AppActionTypes.REMOVE_NOTIFICATION, payload: id });
    },

    toggleSidebar: () => {
      dispatch({ type: AppActionTypes.SET_SIDEBAR_OPEN, payload: !state.sidebarOpen });
    },

    setSidebarOpen: (open) => {
      dispatch({ type: AppActionTypes.SET_SIDEBAR_OPEN, payload: open });
    },

    setSearchQuery: (query) => {
      dispatch({ type: AppActionTypes.SET_SEARCH_QUERY, payload: query });
    },

    setFilters: (filters) => {
      dispatch({ type: AppActionTypes.SET_FILTERS, payload: filters });
    },

    clearFilters: () => {
      dispatch({ 
        type: AppActionTypes.SET_FILTERS, 
        payload: { category: '', date: '', status: '' }
      });
    },

    // Optimistic updates
    performOptimisticUpdate: async (id, optimisticData, mutationFn, queryKey) => {
      // Store optimistic update
      dispatch({ 
        type: AppActionTypes.OPTIMISTIC_UPDATE, 
        payload: { id, data: optimisticData }
      });

      // Update query cache optimistically
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        
        if (Array.isArray(old)) {
          return old.map(item => item.id === id ? { ...item, ...optimisticData } : item);
        } else if (old.id === id) {
          return { ...old, ...optimisticData };
        }
        
        return old;
      });

      try {
        // Perform actual mutation
        const result = await mutationFn();
        
        // Clear optimistic update on success
        dispatch({ type: AppActionTypes.REVERT_OPTIMISTIC_UPDATE, payload: id });
        
        // Invalidate and refetch the query
        queryClient.invalidateQueries({ queryKey });
        
        return result;
      } catch (error) {
        // Revert optimistic update on error
        dispatch({ type: AppActionTypes.REVERT_OPTIMISTIC_UPDATE, payload: id });
        queryClient.invalidateQueries({ queryKey });
        throw error;
      }
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;