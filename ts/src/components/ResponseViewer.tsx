import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Code, 
  PackageCheck, 
  ExternalLink, 
  Clock, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import type { ApiResponseResult } from '../services/apiService';

interface ResponseViewerProps {
  response: ApiResponseResult | null;
  onCopyJson: (jsonString: string) => void;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, onCopyJson }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'json' | 'metadata'>('card');
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 153, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--amazon-amber)',
          }}
        >
          <Code size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Henüz İstek Gönderilmedi</h3>
        <p style={{ maxWidth: '440px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Yukarıdaki alana bir Amazon ürün bağlantısı girip "API'ye Gönder" butonuna basarak gelen ürün verilerini ve API yanıtını burada görüntüleyebilirsiniz.
        </p>
      </div>
    );
  }

  const jsonString = JSON.stringify(response.rawJson, null, 2);

  const handleCopy = () => {
    onCopyJson(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '24px' }}>
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className={`badge ${response.success ? 'badge-green' : 'badge-red'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            {response.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>HTTP {response.status} ({response.statusText})</span>
          </span>

          <span
            className="badge badge-amber"
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <Clock size={14} />
            <span>{response.responseTimeMs} ms</span>
          </span>

          {response.asinSent && (
            <span className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              ASIN: {response.asinSent}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('card')}
            className={`btn ${activeTab === 'card' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <PackageCheck size={16} />
            <span>Ürün Kartı</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`btn ${activeTab === 'json' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <Code size={16} />
            <span>Ham JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`btn ${activeTab === 'metadata' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.825rem' }}
          >
            <Terminal size={16} />
            <span>İstek Detayları</span>
          </button>
        </div>
      </div>

      {!response.success && (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-red)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <div style={{ fontWeight: 700 }}>API İsteği Başarısız Oldu</div>
            <div>{response.error}</div>
          </div>
        </div>
      )}

      {activeTab === 'card' && response.product && (
        <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#fff',
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '340px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              }}
            >
              
            </div>
            
            <a
              href={response.urlSent}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }}
            >
              <ExternalLink size={16} />
              <span>Amazon'da Orijinal Sayfayı Aç</span>
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
        


            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span
                style={{
                  color: response.product.inStock ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={16} />
                {response.product.inStock ? 'Stokta Var' : 'Stok Tükendi'}
              </span>

              <span
                style={{
                  color: response.product.inStock ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={16} />
                {response.product.inStock ? 'Stokta Var' : 'Stok Tükendi'}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(255, 153, 0, 0.08)',
                border: '1px solid rgba(255, 153, 0, 0.2)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amazon-amber)' }}>
                {response.product.name}
              </div>
            </div>


            <div
              style={{
                background: 'rgba(255, 153, 0, 0.08)',
                border: '1px solid rgba(255, 153, 0, 0.2)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amazon-amber)' }}>
                {response.product.price.toLocaleString('tr-TR')} TL
              </div>

            </div>

            <div
              style={{
                background: 'rgba(255, 153, 0, 0.08)',
                border: '1px solid rgba(255, 153, 0, 0.2)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amazon-amber)' }}>
                {response.product.scrapedAt}
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'json' && (
        <div className="animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>API Yanıt Payload (JSON)</span>
            <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı!' : 'JSON Kopyala'}</span>
            </button>
          </div>

          <div className="json-container">
            <pre style={{ margin: 0, color: 'var(--accent-cyan)' }}>
              {jsonString}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: 'rgba(12, 15, 23, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--amazon-amber)' }}>
              İstek Özeti (Request Summary)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-subtle)' }}>HTTP Metodu:</span>
              <span style={{ fontWeight: 700 }}>{response.requestDetails.method}</span>

              <span style={{ color: 'var(--text-subtle)' }}>Uç Nokta:</span>
              <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--accent-cyan)' }}>
                {response.requestDetails.endpoint}
              </span>

              <span style={{ color: 'var(--text-subtle)' }}>Yanıt Süresi:</span>
              <span>{response.responseTimeMs} ms</span>

              <span style={{ color: 'var(--text-subtle)' }}>Gönderilen URL:</span>
              <span style={{ wordBreak: 'break-all' }}>{response.urlSent}</span>
            </div>
          </div>

          {/* Request Headers */}
          <div style={{ background: 'rgba(12, 15, 23, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-cyan)' }}>
              İstek Başlıkları (Headers Sent)
            </h4>
            <div className="json-container">
              <pre style={{ margin: 0, color: 'var(--text-main)' }}>
                {JSON.stringify(response.requestDetails.headers, null, 2)}
              </pre>
            </div>
          </div>

          {response.requestDetails.bodySent && (
            <div style={{ background: 'rgba(12, 15, 23, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-purple)' }}>
                Gönderilen JSON Verisi (Body Payload)
              </h4>
              <div className="json-container">
                <pre style={{ margin: 0, color: 'var(--accent-purple)' }}>
                  {JSON.stringify(response.requestDetails.bodySent, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
