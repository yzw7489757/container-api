import { EnvTypeEnum } from '@iron-man/container-api';
import genImportScript from '../../utils/loadscript';
import { genFullUrlWithQuery } from '../../utils/genUrl';

let callbackId = 1;

function makeCallbackFnName(options: CallJsonpOptions) {
  const { callbackFnName } = options;
  if (callbackFnName) {
    return callbackFnName;
  }

  const { callbackFnPrefix = 'jsonpCallback_' } = options;
  // eslint-disable-next-line no-plusplus
  return `${callbackFnPrefix}${callbackId++}`;
}

export interface CallJsonpOptions {
  timeout?: number;
  callback?: string;
  callbackFnPrefix?: string;
  callbackFnName?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

const DEFAULT_TIMEOUT = 20000;

function createJsonpService(envType: EnvTypeEnum) {
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
  return async function Jsonp<TResult = any>(
    url: string,
    data: Record<string, string | number>,
    options: CallJsonpOptions
  ) {
    return new Promise<TResult>((resolve, reject) => {
      const callback = options.callback || 'callback'
      const callbackFnName = makeCallbackFnName(options);

      (window as any)[callbackFnName] = (result: TResult) => resolve(result);

      setTimeout(() => {
        reject(new Error('JSONP timeout'));
      }, options.timeout || DEFAULT_TIMEOUT);

      const instance = new genImportScript()
        .setUrl(
          basicHost +
            genFullUrlWithQuery(url, {
              ...(data || {}),
              [callback]: callbackFnName,
            })
        )
        .setAttrs({
          crossOrigin: options.crossOrigin || '',
        });
      void (async () => {
        try {
          await instance.load();
          setTimeout(() => {
            reject(new Error('Invalid JSONP API - callback not called'));
          });
        } catch (err) {
          reject(err);
        } finally {
          (window as any)[callbackFnName] = undefined;
        }
      })();
    });
  };
}

export default createJsonpService;
