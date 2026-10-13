import type { AmazonUrlParseResult } from '../utils/amazonParser';

export interface ApiConfig {
  endpointUrl: string;
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  useMock: boolean;
  mockDelayMs: number;
}

export interface ProductData {
  name: string;
  price: number;
  inStock: boolean;
  scrapedAt: string;
}

export interface ApiResponseResult {
  success: boolean;
  status: number;
  statusText: string;
  responseTimeMs: number;
  urlSent: string;
  asinSent?: string;
  product?: ProductData;
  rawJson: Record<string, any>;
  error?: string;
  requestDetails: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    bodySent?: any;
  };
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  endpointUrl: 'https://api.example.com/v1/parse-amazon',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token-123',
    'X-Client-App': 'AmazonLinkParserFrontend',
  },
  useMock: true,
  mockDelayMs: 1200,
};


export async function sendAmazonUrlToApi(
  parsedInfo: AmazonUrlParseResult,
  config: ApiConfig
): Promise<ApiResponseResult> {
  const startTime = performance.now();

  if (config.useMock) {
    await new Promise((resolve) => setTimeout(resolve, config.mockDelayMs));
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return generateMockApiResponse(parsedInfo, config, responseTime);
  }

  try {
    const payload = {
      url: parsedInfo.url,
      cleanUrl: parsedInfo.cleanUrl,
      asin: parsedInfo.asin,
      domain: parsedInfo.domain,
      timestamp: new Date().toISOString(),
    };

    let fetchUrl = config.endpointUrl;
    let options: RequestInit = {
      method: config.method,
      headers: config.headers,
    };

    if (config.method === 'POST') {
      options.body = JSON.stringify(payload);
    } else {
      const urlObj = new URL(config.endpointUrl);
      urlObj.searchParams.append('url', parsedInfo.url);
      if (parsedInfo.asin) urlObj.searchParams.append('asin', parsedInfo.asin);
      fetchUrl = urlObj.toString();
    }

    const response = await fetch(fetchUrl, options);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    let responseData: any;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        statusText: response.statusText || 'API Hatası',
        responseTimeMs: responseTime,
        urlSent: parsedInfo.url,
        asinSent: parsedInfo.asin,
        rawJson: responseData,
        error: responseData.message || `API ${response.status} kodlu bir hata döndürdü.`,
        requestDetails: {
          method: config.method,
          endpoint: fetchUrl,
          headers: config.headers,
          bodySent: config.method === 'POST' ? payload : undefined,
        },
      };
    }

    return {
      success: true,
      status: response.status,
      statusText: '200 OK',
      responseTimeMs: responseTime,
      urlSent: parsedInfo.url,
      asinSent: parsedInfo.asin,
      product: responseData.product || extractProductFromRaw(responseData),
      rawJson: responseData,
      requestDetails: {
        method: config.method,
        endpoint: fetchUrl,
        headers: config.headers,
        bodySent: config.method === 'POST' ? payload : undefined,
      },
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      success: false,
      status: 0,
      statusText: 'Network / CORS Error',
      responseTimeMs: Math.round(endTime - startTime),
      urlSent: parsedInfo.url,
      asinSent: parsedInfo.asin,
      rawJson: { error: err.message || 'Bağlantı hatası' },
      error: `API'ye bağlanılamadı: ${err.message || 'CORS engeli veya sunucu kapalı olabilir.'}`,
      requestDetails: {
        method: config.method,
        endpoint: config.endpointUrl,
        headers: config.headers,
      },
    };
  }
}


function generateMockApiResponse(
  parsedInfo: AmazonUrlParseResult,
  config: ApiConfig,
  responseTimeMs: number
): ApiResponseResult {
  const asin = parsedInfo.asin || 'B08N5WRWNW';
  
  const mockProducts: Record<string, ProductData> = {
    DEFAULT: {
      name: 'Sony WH-1000XM5 Kablosuz Gürültü Engelleme Özellikli Kulak Üstü Kulaklık',
      price: 14499.00,
      inStock: true,
      scrapedAt: new Date().toISOString(),
    },
  };

  const product = mockProducts.DEFAULT;

  const mockPayload = {
    status: 'success',
    code: 200,
    message: 'Amazon ürün verisi başarıyla ayrıştırıldı ve çekildi.',
    meta: {
      url: parsedInfo.url,
      cleanUrl: parsedInfo.cleanUrl,
      asin: asin,
      domain: parsedInfo.domain || 'amazon.com.tr',
      parsedAt: new Date().toISOString(),
      apiVersion: 'v2.4.0',
    },
    product: product,
  };

  return {
    success: true,
    status: 200,
    statusText: '200 OK (Mock)',
    responseTimeMs,
    urlSent: parsedInfo.url,
    asinSent: asin,
    product,
    rawJson: mockPayload,
    requestDetails: {
      method: config.method,
      endpoint: `${config.endpointUrl} (MOCK SIMULATION)`,
      headers: config.headers,
      bodySent: {
        url: parsedInfo.url,
        asin: asin,
        cleanUrl: parsedInfo.cleanUrl,
      },
    },
  };
}

function extractProductFromRaw(raw: any): ProductData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  if (raw.product) return raw.product;
  if (raw.title && raw.price) return raw as ProductData;
  return undefined;
}
