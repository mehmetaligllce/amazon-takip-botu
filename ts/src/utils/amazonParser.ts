export interface AmazonUrlParseResult {
  isValid: boolean;
  url: string;
  asin?: string;
  domain?: string;
  cleanUrl?: string;
  error?: string;
}


export function parseAmazonUrl(urlInput: string): AmazonUrlParseResult {
  const trimmed = urlInput.trim();

  if (!trimmed) {
    return {
      isValid: false,
      url: trimmed,
      error: 'Lütfen bir Amazon URL adresi girin.',
    };
  }

  let formattedUrl = trimmed;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const parsedUrl = new URL(formattedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    const isAmazonDomain = 
      hostname.includes('amazon.') || 
      hostname === 'amzn.to' || 
      hostname === 'amzn.eu' ||
      hostname.includes('amzn');

    if (!isAmazonDomain) {
      return {
        isValid: false,
        url: trimmed,
        error: 'Geçersiz alan adı. Lütfen geçerli bir Amazon bağlantısı girin (örn: amazon.com, amazon.com.tr, amzn.to).',
      };
    }

    const asinMatch = 
      formattedUrl.match(/(?:dp|gp\/product|o\/ASIN|product-reviews|ASIN)\/([A-Z0-9]{10})/i) ||
      formattedUrl.match(/\/([B][A-Z0-9]{9})(?:[?\/#]|$)/i) ||
      formattedUrl.match(/\/([0-9]{9}[X0-9])(?:[?\/#]|$)/i);

    const asin = asinMatch ? asinMatch[1].toUpperCase() : undefined;

    const cleanUrl = asin 
      ? `https://${hostname}/dp/${asin}` 
      : `${parsedUrl.origin}${parsedUrl.pathname}`;

    return {
      isValid: true,
      url: formattedUrl,
      asin,
      domain: hostname,
      cleanUrl,
    };
  } catch {
    return {
      isValid: false,
      url: trimmed,
      error: 'Geçersiz URL formatı. Lütfen tam bir web adresi girin (örn: https://www.amazon.com/dp/...)',
    };
  }
}

export const SAMPLE_AMAZON_URLS = [
  {
    title: 'Sony WH-1000XM5 Kablosuz Kulak Üstü Kulaklık',
    url: 'https://www.amazon.com.tr/dp/B0A12345XM',
    asin: 'B0A12345XM',
    category: 'Elektronik',
  },
  {
    title: 'Apple MacBook Pro 16" M3 Max',
    url: 'https://www.amazon.com/dp/B0CM5JV232',
    asin: 'B0CM5JV232',
    category: 'Bilgisayar',
  },
  {
    title: 'Kindle Paperwhite 16 GB',
    url: 'https://www.amazon.de/dp/B09TMN58Y7',
    asin: 'B09TMN58Y7',
    category: 'E-Okuyucu',
  },
];
