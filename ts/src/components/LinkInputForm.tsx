import React, { useState, useEffect } from 'react';
import { Link2, Send, CheckCircle2, AlertCircle, Sparkles, X, Loader2, Tag } from 'lucide-react';
import { parseAmazonUrl, SAMPLE_AMAZON_URLS } from '../utils/amazonParser';
import type { AmazonUrlParseResult } from '../utils/amazonParser';

interface LinkInputFormProps {
  onSubmit: (parsedInfo: AmazonUrlParseResult) => void;
  isLoading: boolean;
  loadingStep: number;
}

export const LinkInputForm: React.FC<LinkInputFormProps> = ({
  onSubmit,
  isLoading,
  loadingStep,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [parseResult, setParseResult] = useState<AmazonUrlParseResult | null>(null);

  useEffect(() => {
    if (!urlInput.trim()) {
      setParseResult(null);
      return;
    }
    const result = parseAmazonUrl(urlInput);
    setParseResult(result);
  }, [urlInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseAmazonUrl(urlInput);
    if (!result.isValid) {
      setParseResult(result);
      return;
    }
    onSubmit(result);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
  };

  const handleClear = () => {
    setUrlInput('');
    setParseResult(null);
  };

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '28px', marginBottom: '28px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="var(--amazon-amber)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Amazon Ürün Bağlantısı Girin</h2>
        </div>
        
        {parseResult && parseResult.isValid && parseResult.asin && (
          <span className="badge badge-amber animate-slide-up">
            <Tag size={12} />
            ASIN: {parseResult.asin}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative' }}>
          
          <div style={{ flex: '1 1 320px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Link2 size={20} />
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="https://www.amazon.com.tr/dp/B08N5WRWNW veya amzn.to/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              style={{
                paddingLeft: '44px',
                paddingRight: urlInput ? '40px' : '16px',
                borderColor: parseResult
                  ? parseResult.isValid
                    ? 'rgba(16, 185, 129, 0.5)'
                    : 'rgba(239, 68, 68, 0.5)'
                  : undefined,
              }}
            />

            {urlInput && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !urlInput.trim()}
            style={{ minWidth: '160px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>API'ye Gönder</span>
              </>
            )}
          </button>
        </div>

        {parseResult && (
          <div
            className="animate-slide-up"
            style={{
              marginTop: '12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: parseResult.isValid ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          >
            {parseResult.isValid ? (
              <>
                <CheckCircle2 size={16} />
                <span>Geçerli Amazon Bağlantısı ({parseResult.domain})</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                <span>{parseResult.error}</span>
              </>
            )}
          </div>
        )}
      </form>

      {isLoading && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(12, 15, 23, 0.9)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>İstek Durumu</span>
            <span>{loadingStep}/4 Adım</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {['1. URL Doğrulama', '2. API Bağlantısı', '3. Veri Çekme', '4. Yanıt Ayrıştırma'].map((label, idx) => {
              const stepNum = idx + 1;
              const isDone = loadingStep > stepNum;
              const isCurrent = loadingStep === stepNum;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: isDone
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isCurrent
                      ? 'rgba(255, 153, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: isDone
                      ? 'var(--accent-green)'
                      : isCurrent
                      ? 'var(--amazon-amber)'
                      : 'var(--text-subtle)',
                    border: `1px solid ${
                      isDone
                        ? 'rgba(16, 185, 129, 0.3)'
                        : isCurrent
                        ? 'var(--amazon-amber)'
                        : 'transparent'
                    }`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCurrent && <Loader2 size={12} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} />}
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '8px' }}>
          Hızlı Test İçin Örnek Amazon Bağlantıları:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SAMPLE_AMAZON_URLS.map((sample, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-ghost"
              onClick={() => handleSelectSample(sample.url)}
              style={{
                fontSize: '0.775rem',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
              }}
            >
              <Tag size={12} color="var(--amazon-amber)" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
