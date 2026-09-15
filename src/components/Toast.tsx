'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const success = useCallback(
    (message: string) => toast(message, 'success'),
    [toast]
  );
  const error = useCallback(
    (message: string) => toast(message, 'error'),
    [toast]
  );
  const info = useCallback(
    (message: string) => toast(message, 'info'),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Небольшая задержка для анимации появления
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const colors: Record<ToastType, { border: string; bg: string; icon: string; text: string }> = {
    success: {
      border: 'border-green-500/40',
      bg: 'bg-green-500/10',
      icon: '✓',
      text: 'text-green-400',
    },
    error: {
      border: 'border-red-500/40',
      bg: 'bg-red-500/10',
      icon: '✕',
      text: 'text-red-400',
    },
    info: {
      border: 'border-[var(--accent)]/40',
      bg: 'bg-[var(--accent)]/10',
      icon: 'ℹ',
      text: 'text-[var(--accent-light)]',
    },
  };

  const c = colors[toast.type];

  return (
    <div
      onClick={() => onClose(toast.id)}
      className={`pointer-events-auto cursor-pointer min-w-[280px] max-w-[400px] glass-card rounded-xl px-4 py-3 flex items-start gap-3 border ${c.border} ${c.bg} transition-all duration-300 ${
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-[120%] opacity-0'
      }`}
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${c.text}`}
      >
        {c.icon}
      </div>
      <p className="text-sm text-[var(--text-primary)] flex-1 break-words">
        {toast.message}
      </p>
    </div>
  );
}