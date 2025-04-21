// components/use-toast.ts
"use client";

import React from "react";

type ToastType = "default" | "destructive";
  // shared/components/use-toast.ts
export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive'; // Añade esta línea
}


interface ToastContextType {
  toasts: Toast[];
  toast: (props: {
    title: string;
    description?: string;
    type?: ToastType;
  }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "default" }: {
      title: string;
      description?: string;
      type?: ToastType;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((current) => [...current, { id, title, description, type }]);

      const timer = setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 5000);

      return () => clearTimeout(timer);
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  dismissToast,
}: {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} dismissToast={dismissToast} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  dismissToast,
}: {
  toast: Toast;
  dismissToast: (id: string) => void;
}) {
  const bgColor = toast.type === "destructive" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex justify-between items-center min-w-[300px]`}
    >
      <div>
        <p className="font-bold">{toast.title}</p>
        {toast.description && (
          <p className="text-sm">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className="ml-4"
      >
        ×
      </button>
    </div>
  );
}


export function useToast() {
  const toast = (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive'; // Añade esta línea
  }) => {
    // implementación existente
  };

  return { toast };
}