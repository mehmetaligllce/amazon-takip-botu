import React from 'react';
import { ShoppingBag, Settings, History, Server } from 'lucide-react';

interface HeaderProps {
  onToggleConfig: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  useMock: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleConfig,
  onToggleHistory,
  historyCount,
  useMock,
}) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF9900 0%, #E67E00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255, 153, 0, 0.4)',
              color: '#000',
            }}
          >
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Amazon Parser
              </h1>
              <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                API Hub v2
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Amazon ürün bağlantılarını analiz et & API uç noktalarına aktar
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <div
            onClick={onToggleConfig}
            title="API Ayarlarını Değiştir"
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: useMock ? 'rgba(0, 242, 254, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${useMock ? 'rgba(0, 242, 254, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: useMock ? 'var(--accent-cyan)' : 'var(--accent-green)',
            }}
          >
            <Server size={14} />
            <span>{useMock ? 'Mock API (Simülasyon)' : 'Canlı API Sunucusu'}</span>
          </div>

          <button
            onClick={onToggleHistory}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <History size={16} />
            <span>Geçmiş</span>
            {historyCount > 0 && (
              <span
                style={{
                  background: 'var(--amazon-amber)',
                  color: '#000',
                  borderRadius: '9999px',
                  padding: '1px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleConfig}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Settings size={16} />
            <span>API Ayarları</span>
          </button>
        </div>

      </div>
    </header>
  );
};
