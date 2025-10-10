import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

// Enhanced toast notification service
export const notify = {
  success: (message, options = {}) => {
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5" />,
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
      ...options
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      icon: <XCircle className="w-5 h-5" />,
      duration: 6000,
      style: {
        background: '#ef4444',
        color: '#ffffff',
      },
      ...options
    });
  },

  warning: (message, options = {}) => {
    toast((t) => (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        <span>{message}</span>
      </div>
    ), {
      duration: 5000,
      style: {
        background: '#fbbf24',
        color: '#ffffff',
      },
      ...options
    });
  },

  info: (message, options = {}) => {
    toast((t) => (
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-500" />
        <span>{message}</span>
      </div>
    ), {
      duration: 4000,
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
      ...options
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        success: {
          duration: 4000,
          icon: <CheckCircle className="w-5 h-5" />,
        },
        error: {
          duration: 6000,
          icon: <XCircle className="w-5 h-5" />,
        },
        ...options
      }
    );
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  }
};

// API error handler
export const handleApiError = (error) => {
  let message = 'An unexpected error occurred';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.validationErrors) {
    // Handle validation errors
    const validationErrors = error.response.data.validationErrors;
    const errorMessages = Object.values(validationErrors).join(', ');
    message = errorMessages || 'Validation failed';
  } else if (error.message) {
    message = error.message;
  }

  notify.error(message);
  return message;
};

// Success handler for API operations
export const handleApiSuccess = (message, data = null) => {
  notify.success(message);
  return { message, data };
};

export default notify;