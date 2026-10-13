import React, { useState } from 'react';
import { X, Server, Globe, Key, ToggleLeft, ToggleRight, Plus, Trash2, Sliders } from 'lucide-react';
import type { ApiConfig } from '../services/apiService';

interface ApiConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (newConfig: ApiConfig) => void;
}

export const ApiConfigPanel: React.FC<ApiConfigPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<ApiConfig>({ ...config });
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  if (!isOpen) return null;

  const handleToggleMock = () => {
    setLocalConfig((prev) => ({ ...prev, useMock: !prev.useMock }));
  };

  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    setLocalConfig((prev) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [newHeaderKey.trim()]: newHeaderValue.trim(),
      },
    }));
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveHeader = (keyToRemove: string) => {
    setLocalConfig((prev) => {
      const nextHeaders = { ...prev.headers };
      delete nextHeaders[keyToRemove];
      return { ...prev, headers: nextHeaders };
    });
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: '#0d1117',
          borderColor: 'rgba(255, 153, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={22} color="var(--amazon-amber)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>API Uç Noktası Yapılandırması</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: localConfig.useMock ? 'rgba(0, 242, 254, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: `1px solid ${localConfig.useMock ? 'rgba(0, 242, 254, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
              <Server size={18} color={localConfig.useMock ? 'var(--accent-cyan)' : 'var(--accent-green)'} />
              <span>{localConfig.useMock ? 'Mock Simülasyon Modu Aktif' : 'Canlı Sunucu İstek Modu Aktif'}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {localConfig.useMock
                ? 'Harici sunucu gerektirmeden tam ürün verisi ve yanıt simülasyonu üretir.'
                : 'Belirlediğiniz API URL adresine gerçek HTTP `fetch` isteği gönderir.'}
            </p>
          </div>

          <button
            onClick={handleToggleMock}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: localConfig.useMock ? 'var(--accent-cyan)' : 'var(--accent-green)',
            }}
          >
            {localConfig.useMock ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Hedef API Uç Noktası URL (Target Endpoint)
          </label>
          <div style={{ position: 'relative' }}>
            <Globe size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="input-field"
              value={localConfig.endpointUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, endpointUrl: e.target.value })}
              style={{ paddingLeft: '42px' }}
              placeholder="https://api.siteniz.com/parse veya http://localhost:5000/api/parse"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            HTTP Metodu
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['POST', 'GET'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`btn ${localConfig.method === m ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLocalConfig({ ...localConfig, method: m })}
                style={{ flex: 1 }}
              >
                {m} {m === 'POST' ? '(JSON Body)' : '(Query Params)'}
              </button>
            ))}
          </div>
        </div>

        {localConfig.useMock && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Simüle Edilen Yanıt Gecikmesi</span>
              <span style={{ color: 'var(--amazon-amber)', fontWeight: 700 }}>{localConfig.mockDelayMs} ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="4000"
              step="100"
              value={localConfig.mockDelayMs}
              onChange={(e) => setLocalConfig({ ...localConfig, mockDelayMs: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--amazon-amber)' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Key size={16} color="var(--amazon-amber)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>İstek Başlıkları (Request Headers)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {Object.entries(localConfig.headers).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.825rem',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{key}:</span>
                <span style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(key)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Header Key (örn: X-API-Key)"
              value={newHeaderKey}
              onChange={(e) => setNewHeaderKey(e.target.value)}
              style={{ flex: 1, fontSize: '0.8rem' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Header Value"
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              style={{ flex: 1, fontSize: '0.8rem' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddHeader}
              style={{ padding: '8px 12px' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Ayarları Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};
