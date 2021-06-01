import React, { useEffect, ComponentType, useCallback, useMemo, useRef } from 'react';
import { ComponentLoaderProps, ContainerProps, ModuleType, ContainerAbility, ContainerOptions } from '@iron-man/container-api';
import { useDeepMemo, useSafeTrackingRef } from '@/utils/hook';
import { ErrorBoundaryWrapper } from '@/wrapper/ErrorBoundaryContainer';
import { Suspense } from '@/wrapper/SuspenseContainer';
import { ErrorRenderHelp } from '@/wrapper/ErrorBoundaryContainer';
import { CantGetModuleInfo } from '@/errors/CantGetModuleInfo';
import Loading from '@/components/Loading';
import { noop } from '@/utils';

import createComponentRegister from './createComponentRegister';

const internalPrefix = `internal://`;
const genInternalName = (name: string) => `${internalPrefix}${name}`;

class AbstractComponent extends React.Component<any> {
  render(){
    return null
  }
}
const INTERNAL_MODULES: ContainerProps['modules'] = {
  [genInternalName('Loading')]: {
    type: 'local',
    module: Loading,
  },
  [genInternalName('Error')]: {
    type: 'local',
    module: (props: any) => <div>{props.error?.error?.toString()}</div>,
  },
};

function getInternalModule<T = any>(componentName: string, options: ContainerOptions): ComponentType<T> | null{
  //  /^\w+\:\/\//.test(componentName)
  const internalName = componentName.startsWith(internalPrefix) ? componentName : genInternalName(componentName);
  const tries: Array<() => ModuleType | null> = [
    () => options.customResolveModuleRule?.call(null, internalName) || null,
    () => options.modules && options.modules[internalName] || null,
    () => INTERNAL_MODULES?.[internalName] || null
  ];

  for (const getter of tries) {
    try {
      const result = getter();
      if (result && result.type === 'local') {
        return result.module as ComponentType<T>;
      } else if (result && (result.type === 'lazy' || result.type === 'remote')) {
        // TODO: transfer local module?
        throw new Error('must be local module');
      }
    } catch (err) {
      console.log('err: ', err);
    }
  };

  return null;
}



export const createComponentLoader = (origin: ContainerAbility, options: ContainerOptions): Pick<ContainerAbility, 'ComponentLoader' | 'preLoadComponent'> => {
  const { getComponentInfo } = createComponentRegister(options, INTERNAL_MODULES);

  const ErrorComponent = getInternalModule('Error', options) || AbstractComponent;
  const LoadingComponent = getInternalModule('Loading', options) || AbstractComponent;

  const defaultRenderError: ComponentLoaderProps['renderError'] = (error: any, type) => <ErrorComponent error={error} />;
  const defaultRenderLoading: ComponentLoaderProps['renderLoading'] = () => <LoadingComponent />;

  const componentLoader = (loaderProps: ComponentLoaderProps) => {
    const { renderError = defaultRenderError, renderLoading: RenderLoading = defaultRenderLoading, componentURI, onError = noop, onLoad } = loaderProps;
    const innerProps = useDeepMemo(() => loaderProps.props || {}, [loaderProps.props]);
    const onLoadRef = useSafeTrackingRef(onLoad || noop);

    const renderErrorForRender = useCallback((props: ErrorRenderHelp) => renderError(props, 'render'), [renderError]);
    const handleErrorForRender = useCallback((error: any) => onError(error, 'render'), [onError]);

    const handleLoad = useCallback(
      (componentClass?: unknown) => {
        onLoadRef.current(componentClass);
      },
      [onLoadRef]
    );
    return (
      <ErrorBoundaryWrapper renderError={renderErrorForRender as ComponentType<ErrorRenderHelp>} onError={handleErrorForRender}>
        <Suspense fallback={RenderLoading()}>
          <ComponentRender componentURI={componentURI} innerProps={innerProps} onLoad={handleLoad} />
        </Suspense>
      </ErrorBoundaryWrapper>
    );
  };

  type ComponentRenderProps = Omit<ComponentLoaderProps, 'props'> & {
    innerProps: Record<string, any>,
    onLoad: (component: unknown) => void
  }
  const ComponentRender: React.FC<ComponentRenderProps> = (props) => {
    const { componentURI, innerProps = {} } = props;
    const hasLoadRef = useRef(false);
    const onLoadRef = useSafeTrackingRef(props.onLoad);
    const componentInfo = useMemo(() => getComponentInfo(componentURI), [componentURI]);
    console.log('componentInfo: ', componentInfo);
    const componentResult = componentInfo?.component;

    useEffect(() => {
      console.log(componentResult)
      if (!hasLoadRef.current && componentResult) {
        hasLoadRef.current = true;
        onLoadRef.current(componentResult);
      }
    }, [componentResult]);

    if (!componentInfo) {
      throw new Error(`unknown componentURI ${componentURI}`);
    }

    return <>{componentInfo.render(innerProps)}</>;
  };

  return {
    ComponentLoader: componentLoader,
    preLoadComponent: async (componentURI: string, libraryName: string) => {
      const componentInfo = getComponentInfo(componentURI);

      if (!componentInfo) {
        throw new CantGetModuleInfo(componentURI);
      }

      return componentInfo.load();
    }
  };
};
