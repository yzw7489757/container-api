import * as React from 'react';
import { withContextType } from './withContext';
import { ContainerContext, ContainerProps } from './ContainerProps';
import { ContainerAbility } from './layers/index';
/**
 * @description 所有导出容器能力的mock实现
 */
export function newUnimplementedError() {
  return new Error('not implemented');
}

export function unimplementedFunction(...args: any[]): any {
  throw newUnimplementedError();
}

export const unimplementedComponent: React.ComponentType<any> = (): any => {
  throw newUnimplementedError();
};

export const withContext: withContextType = unimplementedFunction;
export const containerContext: ContainerContext = React.createContext<ContainerAbility>({} as ContainerAbility);
export const Container: React.FC<ContainerProps> = unimplementedFunction;