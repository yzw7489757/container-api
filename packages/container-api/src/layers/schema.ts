import { ComponentType } from "react";
import { SuspenseAbility } from '../wrapper/suspense';

export type SchemaLayerAbility = {
  ComponentLoader: ComponentType<ComponentLoaderProps>;
  preLoadComponent: (componentName: string, libraryName: string) => Promise<any>;
}

export interface ComponentLoaderProps extends SuspenseAbility {
  /**
   * 组件的地址
   */
  componentURI: string;
  /**
   * 组件属性
   */
  props?: Record<string, any>;
}
