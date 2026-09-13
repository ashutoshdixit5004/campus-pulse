'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toastShelf" className="toast-shelf">
        {toasts.map((toast) => {
          let iconClass = 'fa-solid fa-circle-check';
          let iconColor = 'var(--accent-orange)';

          if (toast.type === 'error') {
            iconClass = 'fa-solid fa-circle-xmark';
            iconColor = 'var(--accent-rose)';
          } else if (toast.type === 'warning') {
            iconClass = 'fa-solid fa-triangle-exclamation';
            iconColor = 'var(--accent-amber)';
          } else if (toast.type === 'info') {
            iconClass = 'fa-solid fa-circle-info';
            iconColor = 'var(--accent-cyan)';
          }

          return (
            <div key={toast.id} className="toast">
              <i className={iconClass} style={{ color: iconColor }}></i>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
