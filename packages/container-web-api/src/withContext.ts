import { createElement, ComponentType, useContext, ContextType } from 'react';
import { ContainerContext } from '@iron-man/container-api';

export const withContext = <TProps = {}, TContextProps = {}>(
  context: ContainerContext,
  mapContextToProps?: (contextData: ContextType<ContainerContext>) => TContextProps
) => {
  const mapCtx: NonNullable<typeof mapContextToProps> = typeof mapContextToProps === 'function' ?  mapContextToProps : ((ctx: ContextType<ContainerContext>) => ctx as unknown as TContextProps);

  return function withClass(ClassCom: ComponentType<TContextProps & TProps>) {
    function WithContext(props: TProps) {
      const data = useContext(context);
      return createElement(ClassCom, { ...props, ...mapCtx(data) });
    }
    WithContext.displayName = `withContext(${ClassCom.displayName || ClassCom.name || 'unknown'})`;
    return WithContext;
  };
}
