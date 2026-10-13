import { useState, useEffect } from 'react';
import {
  Search, AlertCircle, Loader2, Link, CheckCircle2, XCircle,
  Clock, ExternalLink, Package, Plus, Trash2, List, TrendingDown
} from 'lucide-react';

interface ProductResult {
  name: string;
  price: string;
  inStock: boolean;
  scrapedAt: string;
  url?: string;
}

interface TrackedLink {
  id: string;
  url: string;
  label: string;
  targetPrice: number;
  lastResult?: ProductResult;
  loading?: boolean;
}

const API = 'http://localhost:5000/api/price';

export function App() {
  const [links, setLinks] = useState<TrackedLink[]>(() => {
    const saved = localStorage.getItem('tracked_links');
    return saved ? JSON.parse(saved) : [];
  });

  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'query'>('links');

  const [singleUrl, setSingleUrl] = useState('');
  const [singleResult, setSingleResult] = useState<ProductResult | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tracked_links', JSON.stringify(links));
  }, [links]);

  const fetchPrice = async (url: string): Promise<ProductResult> => {
    const res = await fetch(`${API}?url=${encodeURIComponent(url)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      name: data.name || 'İsimsiz Ürün',
      price: data.price || '-',
      inStock: data.inStock ?? true,
      scrapedAt: data.scrapedAt
        ? new Date(data.scrapedAt).toLocaleString('tr-TR')
        : new Date().toLocaleString('tr-TR'),
      url: data.url || url,
    };
  };

  const handleFetchLink = async (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, loading: true } : l));
    const link = links.find(l => l.id === id)!;
    try {
      const result = await fetchPrice(link.url);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, lastResult: result, loading: false } : l));
    } catch {
      setLinks(prev => prev.map(l => l.id === id ? { ...l, loading: false } : l));
    }
  };

  const handleFetchAll = async () => {
    for (const link of links) {
      await handleFetchLink(link.id);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newUrl.trim()) { setAddError('URL zorunlu'); return; }
    const target = parseFloat(newTargetPrice.replace(',', '.'));
    if (isNaN(target) || target <= 0) { setAddError('Geçerli bir hedef fiyat girin'); return; }

    const newLink: TrackedLink = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      label: newLabel.trim() || newUrl.trim(),
      targetPrice: target,
    };
    setLinks(prev => [...prev, newLink]);
    setNewUrl('');
    setNewLabel('');
    setNewTargetPrice('');
  };

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleSingleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);
    setSingleResult(null);
    setSingleLoading(true);
    try {
      const result = await fetchPrice(singleUrl.trim());
      setSingleResult(result);
    } catch (err: any) {
      setSingleError(err.message || 'Hata oluştu');
    } finally {
      setSingleLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px 60px' }}>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 800, marginBottom: '8px',
          background: 'linear-gradient(90deg, #FF9900, #FFC837)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Amazon Fiyat Takipçisi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Takip etmek istediğin ürün linklerini ekle, hedef fiyat belirle, anlık fiyatlarını sorgula.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px' }}>
        <button
          onClick={() => setActiveTab('links')}
          className={`btn ${activeTab === 'links' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '10px' }}
        >
          <List size={18} />
          <span>Takip Listesi ({links.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`btn ${activeTab === 'query' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '10px' }}
        >
          <Search size={18} />
          <span>Anlık Sorgula</span>
        </button>
      </div>

      {activeTab === 'links' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Link Ekleme Formu */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>
              Yeni Link Ekle
            </h2>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Link size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Amazon URL (https://www.amazon.com.tr/dp/...)"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder='Etiket (opsiyonel, ör: "Sony Kulaklık")'
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  style={{ flex: 2 }}
                />
                <div style={{ position: 'relative', flex: 1 }}>
                  <TrendingDown size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Hedef Fiyat (TL)"
                    value={newTargetPrice}
                    onChange={e => setNewTargetPrice(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                  />
                </div>
              </div>

              {addError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{addError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Plus size={18} />
                  <span>Listeye Ekle</span>
                </button>
                {links.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleFetchAll}
                    style={{ flex: 1 }}
                  >
                    <Search size={18} />
                    <span>Tümünü Sorgula</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {links.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              <List size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Henüz takip listende ürün yok.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Yukarıdan Amazon linki ekle.</p>
            </div>
          ) : (
            links.map(link => {
              const r = link.lastResult;
              const currentNum = r ? parseFloat(r.price.replace(/\./g, '').replace(',', '.')) : null;
              const belowTarget = currentNum !== null && currentNum <= link.targetPrice;

              return (
                <div
                  key={link.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderColor: belowTarget ? 'rgba(16,185,129,0.5)' : undefined,
                    boxShadow: belowTarget ? '0 0 20px rgba(16,185,129,0.2)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', wordBreak: 'break-all' }}>
                        {link.url}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleFetchLink(link.id)}
                        disabled={link.loading}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        {link.loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        <span>{link.loading ? 'Çekiliyor...' : 'Sorgula'}</span>
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDelete(link.id)}
                        style={{ padding: '6px 10px', color: 'var(--accent-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingDown size={13} />
                      Hedef: <strong style={{ color: 'var(--text-muted)' }}>{link.targetPrice.toLocaleString('tr-TR')} TL</strong>
                    </span>

                    {r ? (
                      <>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.78rem', fontWeight: 600,
                          color: r.inStock ? 'var(--accent-green)' : 'var(--accent-red)',
                        }}>
                          {r.inStock ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {r.inStock ? 'Stokta' : 'Stok Yok'}
                        </span>

                        {r.inStock && (
                          <span style={{
                            fontSize: '0.9rem', fontWeight: 800,
                            color: belowTarget ? 'var(--accent-green)' : 'var(--amazon-amber)',
                          }}>
                            {r.price}
                            {belowTarget && (
                              <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                                ✓ Hedef Altında!
                              </span>
                            )}
                          </span>
                        )}

                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                          <Clock size={11} />
                          {r.scrapedAt}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>— henüz sorgulanmadı</span>
                    )}
                  </div>

                  {r?.name && r.name !== 'İsimsiz Ürün' && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={13} color="var(--amazon-amber)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.name}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--text-subtle)' }}>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'query' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <form onSubmit={handleSingleQuery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Link size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="https://www.amazon.com.tr/dp/..."
                value={singleUrl}
                onChange={e => setSingleUrl(e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={singleLoading || !singleUrl.trim()}
              style={{ width: '100%', padding: '14px' }}
            >
              {singleLoading ? (
                <><Loader2 size={20} className="animate-spin" /><span>Çekiliyor...</span></>
              ) : (
                <><Search size={20} /><span>Sorgula</span></>
              )}
            </button>
          </form>

          {singleResult && (
            <div className="animate-slide-up" style={{
              marginTop: '24px', padding: '20px', borderRadius: '16px',
              background: 'rgba(18, 22, 31, 0.9)', border: '1px solid rgba(255,153,0,0.3)',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                  background: singleResult.inStock ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: singleResult.inStock ? 'var(--accent-green)' : 'var(--accent-red)',
                  border: `1px solid ${singleResult.inStock ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  {singleResult.inStock ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {singleResult.inStock ? 'Stokta Var' : 'Stok Tükendi'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  <Clock size={14} />
                  {singleResult.scrapedAt}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} color="var(--amazon-amber)" /> Ürün Adı
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4 }}>{singleResult.name}</h2>
              </div>

              {singleResult.inStock && (
                <div style={{
                  background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.25)',
                  padding: '14px 18px', borderRadius: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Güncel Fiyat</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amazon-amber)' }}>{singleResult.price}</span>
                </div>
              )}

              <a href={singleResult.url} target="_blank" rel="noreferrer"
                className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>
                <ExternalLink size={16} /><span>Amazon Sayfasını Aç</span>
              </a>
            </div>
          )}

          {singleError && (
            <div className="animate-slide-up" style={{
              marginTop: '20px', padding: '14px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--accent-red)', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{singleError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
