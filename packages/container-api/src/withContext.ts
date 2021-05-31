import { ComponentType, Context, ContextType } from 'react';

export type withContextType = <TContext extends Context<any>, TContextProps extends Record<string, any>>(
              context: TContext, 
              mapContextToProps?: ((contextData: ContextType<TContext>) => TContextProps) | undefined) => 
                <T = unknown>(ClassCom: ComponentType<T & TContextProps>) => ComponentType<T & TContextProps>