'use client';

import { useUIStore } from '../stores';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

function getNotificationStyles(type: string) {
  const baseStyles = 'w-full bg-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-500 ease-in-out animate-in slide-in-from-right-full';
  
  switch (type) {
    case 'success':
      return `${baseStyles} border-l-4 border-green-500 bg-green-50`;
    case 'error':
      return `${baseStyles} border-l-4 border-red-500 bg-red-50`;
    case 'warning':
      return `${baseStyles} border-l-4 border-yellow-500 bg-yellow-50`;
    default:
      return `${baseStyles} border-l-4 border-blue-500 bg-blue-50`;
  }
}

function getTextStyles(type: string) {
  switch (type) {
    case 'success':
      return { primary: 'text-green-800', secondary: 'text-green-600' };
    case 'error':
      return { primary: 'text-red-800', secondary: 'text-red-600' };
    case 'warning':
      return { primary: 'text-yellow-800', secondary: 'text-yellow-600' };
    default:
      return { primary: 'text-blue-800', secondary: 'text-blue-600' };
  }
}

function getButtonStyles(type: string) {
  switch (type) {
    case 'success':
      return 'text-green-400 hover:bg-green-100 focus:ring-green-500';
    case 'error':
      return 'text-red-400 hover:bg-red-100 focus:ring-red-500';
    case 'warning':
      return 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-500';
    default:
      return 'text-blue-400 hover:bg-blue-100 focus:ring-blue-500';
  }
}

export function NotificationToast() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80 max-w-sm">
      {notifications.map((notification) => {
        const textStyles = getTextStyles(notification.type);
        const buttonStyles = getButtonStyles(notification.type);
        
        return (
          <div
            key={notification.id}
            className={getNotificationStyles(notification.type)}
          >
            <div className="p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {notification.type === 'error' && (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  {notification.type === 'warning' && (
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                  )}
                  {notification.type === 'info' && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="ml-2 w-0 flex-1 pt-0.5">
                  <p className={`text-xs font-medium leading-4 ${textStyles.primary}`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <button
                    className={`rounded-md inline-flex p-1 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonStyles}`}
                    onClick={() => removeNotification(notification.id)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
