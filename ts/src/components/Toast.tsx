import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className="animate-slide-up"
            style={{
              pointerEvents: 'auto',
              background: '#0d1117',
              border: `1px solid ${
                isSuccess
                  ? 'rgba(16, 185, 129, 0.4)'
                  : isError
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(0, 242, 254, 0.4)'
              }`,
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSuccess && <CheckCircle2 size={18} color="var(--accent-green)" />}
              {isError && <AlertCircle size={18} color="var(--accent-red)" />}
              {!isSuccess && !isError && <Info size={18} color="var(--accent-cyan)" />}
              <span>{t.message}</span>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
