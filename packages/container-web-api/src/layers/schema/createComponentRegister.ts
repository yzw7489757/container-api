import * as React from 'react';
import { ReactNode, ComponentType } from "react";
import { loadModule } from '@/utils/loadModule';
import { ContainerOptions, ModuleType } from "@iron-man/container-api";
import { InvalidModuleURIError } from '@/errors/InvalidComponentURI';
import { CantGetModuleInfo } from '@/errors/CantGetModuleInfo';
import { InvalidComponentError } from '@/errors/InvalidComponentError';
import createFetcher from '@/utils/createFetcher';
import resolveModule from './resolveModule';
import { Fetcher } from '../../utils/createFetcher';

const getModuleName = (info: ModuleType): string => {
  switch(info.type) {
    case "lazy": {
      return "lazy_module"
    }
    case "local": {
      return "local_module"
    }
    case "remote": {
      return info.name || info.exportName || 'remote_module'
    }
    default: {
      return 'unknown_module'
    }
  }
}
export interface ComponentInfo {
  id: string;
  /**
   * 渲染组件，这是一个fetcher -- 如果没有加载可能会抛出异常的！
   */
  render: (props: unknown) => ReactNode;
  /**
   * 加载组件
   */
  load: () => Promise<unknown>;
  component?: unknown;
}


export default function createComponentRegister (options: ContainerOptions, internalModule: ContainerOptions['modules']) {
  const registryMap = new Map<string, ComponentInfo>();

  const register = (componentURI: string, component: ComponentInfo) => {
    registryMap.set(componentURI.replace(/(\:[a-zA-z0-9]+)/, ''), component);
    return component;
  };

  function registerComponentFromModuleInfo(componentURI: string, info: ModuleType) {
    let _component: any = null;
    function createComponentInfo(fetchComponent: Fetcher<any>): ComponentInfo {
      const load = () => {
        const Component = fetchComponent();
        if (!Component) {
          throw new InvalidComponentError(componentURI, getModuleName(info));
        }
        return _component = Component;
      }
      return {
        id: componentURI,
        render: (props: any) => {
          const Component = load();
          return React.createElement(Component, props);
        },
        load,
        get component() {
          return _component;
        }
      };
    }

    if(info.type === 'local') { // 本地模块
      return register(componentURI, createComponentInfo(() => info.module));
    }

    if(info.type === 'lazy') { // 懒加载模块
      return register(componentURI, createComponentInfo(createFetcher(info.module)));
    }

    if(info.type === 'remote') {
      const fetcher = createFetcher(async () => loadModule({
          name: info.name || 'login',
          url: info.url,
          exportName: info.exportName || '',
          format: info.format || 'UMD'
        })
      );
      
      return register(componentURI, createComponentInfo(fetcher));
    }
    throw new InvalidModuleURIError(componentURI);
  }
  
  // 获取详情，使用缓存
  const getComponentInfo = (componentURI: string) => {
    if (!componentURI || typeof componentURI !== 'string') {
      throw new InvalidModuleURIError(componentURI);
    }

    const cache = registryMap.get(componentURI.replace(/(\:[a-zA-z0-9]+)/, ''));
    if(cache) return cache;

    const info: ModuleType = options.customResolveModuleRule?.call(null, componentURI) || 
    internalModule && internalModule[componentURI] ||
    resolveModule(componentURI, options);
    
    if(!info) {
      throw new CantGetModuleInfo(componentURI);
    }
    
    return registerComponentFromModuleInfo(componentURI, info);
  };

  return {
    registryMap,
    getComponentInfo
  };
}