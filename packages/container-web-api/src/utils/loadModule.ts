import PackageLoader from 'umd-package-loader';
import { get } from 'lodash';
import { InvalidModuleURIError } from '../errors/InvalidComponentURI';

interface LoadModuleOptions {
  name: string;
  url: string;
  exportName: string;
  format: 'UMD' | 'AMD' | 'CMD';
}

export async function loadModule<T = any>(config: LoadModuleOptions): Promise<T> {
  const { url, name, format = 'UMD', exportName } = config;
  if (!url || !name) {
    throw new InvalidModuleURIError(name);
  }

  let module;
  if (typeof window.requirejs === 'undefined' && (format === 'UMD' || format === 'AMD')) {
    // PackageLoader 内置了 amd 判断，暂时先写成一样的
    module = await new PackageLoader({ name, url }).loadScript();
  } else if (typeof window.require !== 'undefined' && (format === 'UMD' || format === 'AMD')) {
    module = await new PackageLoader({ name, url }).loadScript();
  }

  if (module && exportName) {
    return get(module, exportName);
  }

  if (module && module.__esModule && !exportName) {
    return module.default;
  }

  return module;
}
