import { EnvTypeEnum } from '@iron-man/container-api';

interface FetchOptions {
  method: string;
  headers?: HeadersInit;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 20 * 1000;

const createRequestService = (envType: EnvTypeEnum) => {
  let basicHost = '';
  switch (envType) {
    case 'daily':
      basicHost = 'daily.localhost.com';
      break;
    case 'pre-online':
      basicHost = 'pre-online.localhost.com';
      break;
    case 'online':
    default:
      basicHost = 'online.localhost.com';
      break;
  }
  const request = <T = unknown>(url: string, data: any, options: FetchOptions): Promise<T> => {
    const ab = new AbortController();
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        ab.abort();
      }, options.timeout || DEFAULT_TIMEOUT);

      function cleanup() {
        clearTimeout(timeout);
      }

      fetch(basicHost + url, {
        method: options.method,
        body: data || undefined,
        signal: ab.signal,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      })
        .then(res => res.json())
        .catch(err => {
          cleanup();
          reject(err);
        })
        .then(res => {
          cleanup();
          resolve(res);
        });
    });
  };
  return request;
};

export default createRequestService;
