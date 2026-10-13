import React from 'react';
import { X, History, Trash2, ArrowUpRight, CheckCircle2, AlertCircle, Tag } from 'lucide-react';
import type { ApiResponseResult } from '../services/apiService';

export interface HistoryItem {
  id: string;
  timestamp: string;
  url: string;
  asin?: string;
  response: ApiResponseResult;
}

interface HistoryListProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="glass-panel animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          borderRadius: 0,
          background: '#0d1117',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} color="var(--amazon-amber)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>İstek Geçmişi ({history.length})</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '40px 0', fontSize: '0.9rem' }}>
              Henüz geçmiş kayıt bulunmuyor.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    className={`badge ${item.response.success ? 'badge-green' : 'badge-red'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {item.response.success ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    <span>{item.response.status} ({item.response.responseTimeMs}ms)</span>
                  </span>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {item.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-all', fontWeight: 600 }}>
                  {item.url}
                </div>

                {item.asin && (
                  <span className="badge badge-amber" style={{ width: 'fit-content', fontSize: '0.7rem' }}>
                    <Tag size={10} />
                    ASIN: {item.asin}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  style={{ padding: '6px 12px', fontSize: '0.775rem', marginTop: '4px', alignSelf: 'flex-end' }}
                >
                  <span>Yanıtı Görüntüle</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearHistory}
              style={{ width: '100%', color: 'var(--accent-red)' }}
            >
              <Trash2 size={16} />
              <span>Geçmişi Temizle</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
