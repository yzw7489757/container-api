import { omit } from 'lodash';
import { CustomFetcher, ServiceLayerAbility, CustomFetchInnerOptions } from '@iron-man/container-api';
import { ContainerAbility, ContainerOptions } from '@iron-man/container-api';
import { unimplementedAsyncFunction } from '@/utils/initialFunction';
import { InvalidServiceInjection } from '../../errors/InvalidServiceInjection';

function createCustomService(fetcher: CustomFetcher, innerOptions: CustomFetchInnerOptions, options: ContainerOptions) {
  let basicHost = '';
  if ('envHost' in innerOptions) {
    basicHost = (innerOptions.envHost || {})[options.envType || 'online'] || '';
  }
  const DEFAULT_TIMEOUT = 20 * 1000;
  return async function customFetcher<T = unknown>(url: string, data: any) {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('custom fetcher timeout'));
      }, innerOptions.timeout || DEFAULT_TIMEOUT);

      function cleanup() {
        clearTimeout(timeout);
      }
      fetcher<T>(basicHost + url, data, {
        ...(omit(innerOptions, 'timeout') || {}),
        envType: options.envType,
      })
        .then(res => {
          resolve(res);
          cleanup();
        })
        .catch(err => {
          reject(err);
          cleanup();
        })
    });
  };
}

type GenCustomService = Pick<ServiceLayerAbility['service'], 'getCustomService' | 'injectCustomService'>;

const customServices: Record<string, ReturnType<typeof createCustomService>> = Object.create(null);
function createCustomServicePortal(origin: ContainerAbility, options: ContainerOptions): GenCustomService {
  const getCustomService: GenCustomService['getCustomService'] = (serviceName, defaultService?) => {
    if (
      Object.prototype.hasOwnProperty.call(customServices, serviceName) &&
      typeof customServices[serviceName] === 'function'
    ) {
      return customServices[serviceName];
    }
    return defaultService || unimplementedAsyncFunction; // 兜底
  };

  const injectCustomService: GenCustomService['injectCustomService'] = (serviceName, fetcher, innerOptions?) => {
    if (typeof fetcher !== 'function') {
      return Promise.reject(new InvalidServiceInjection(serviceName));
    }
    // 包装自定义服务，统一参数
    customServices[serviceName] = createCustomService(fetcher, innerOptions || {}, options);
    return Promise.resolve();
  };

  return {
    injectCustomService,
    getCustomService,
  };
}
export default createCustomServicePortal;
