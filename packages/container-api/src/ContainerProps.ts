import { ReactNode, Context } from 'react';
import { ContainerAbility } from './layers/index';
export type EnvTypeEnum = 'daily' | 'pre-online' | 'online';

export type RemoteModule = {
  type: 'remote';
  url: string;
  /** 模块名称 library Name */
  name?: string;
  /** 模块的格式, 默认是 AMD */
  format?: 'AMD' | 'UMD' | 'CMD';
  /** 组件的导出名，默认是按 __esModule 的规则来用默认导出 */
  exportName?: string;
};

export type LocalModule = {
  type: 'local';
  module: unknown;
};

export type LazyModule = {
  type: 'lazy';
  module: () => Promise<unknown>;
};

export type ModuleType = LocalModule | RemoteModule | LazyModule;

export type CacheOption = {
  rule: RegExp | string;
  activeCallback?: (page: string, params: Record<string, any>) => boolean | void;
};

export interface ContainerProps {
  children?: ReactNode;

  envType?: EnvTypeEnum;

  // loadPage?: (page: string, pageParams?: any, rawPageParams?: any) => React.ReactNode;

  cacheOptions?: Array<RegExp>;
  /**
   * 自定义解析
   */
  customResolveModuleRule?: (componentURI: string) => ModuleType | null;

  /**
   * resolve module base uri, 定义从哪个域下获取解析模块
   */
  baseModuleURI?: string;

  moduleVersion?: Record<string, string>;
  /**
   * 预置组件
   */
  modules?: {
    readonly [moduleURI: string]: RemoteModule | LazyModule | LocalModule;
  };

  /**
   * 自定义加装动画
   */
  readonly withSuspense?: boolean | React.ComponentType<any>;
  /**
   * 自定义错误边界
   */
  readonly withErrorBoundary?: boolean | React.ComponentType<any>;
}

export type ContainerContext = Context<ContainerAbility>;