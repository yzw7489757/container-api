import React, { ReactElement, useMemo, useRef, useEffect, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import Updatable from '@/helper/Updatable';
import { ContainerProps, NavigationAbility } from '@iron-man/container-api';
import { useForceUpdate, useDeepDiffEffect } from '@/utils/hook';
import {
  buildQueryString,
  getQueryForUrl,
  genFullUrlWithQuery,
  getCurrentHostAndPath,
  isFullUrl,
} from '@/utils/genUrl';
import { safeParseJSON } from '@/utils/index';
import { containerContext as ContainerContext } from '@/containerContext';
import './index.less';

export interface PageStackItem {
  page: string;
  cacheId: string;
  rawPageParams: any;
  getPageParams: () => Record<string, any>;
}

export interface IPageStack {
  getStack(): ReadonlyArray<PageStackItem>;
  push(item: PageStackItem): void;
  pop(): PageStackItem | undefined;
  replace(item: PageStackItem): void;
  size: number;
}

export interface PageStackProps<TItem = any> extends Pick<ContainerProps, 'cacheOptions'> {
  items: ReadonlyArray<TItem>;
  renderItem: (item: TItem, index: number, totalRenderItems: ReadonlyArray<TItem>) => ReactElement;
}

function getCacheId(pageUri: string) {
  if (!pageUri) return '';
  const result = pageUri.match(/\:(\d+)$/);
  return result ? result[1] : '';
}

export function PageStack<TItem extends PageStackItem>({
  items,
  renderItem,
  cacheOptions,
}: PageStackProps<TItem>): any {
  const forceUpdate = useForceUpdate();
  const CacheRouteMap = useMemo(() => new Map<string, TItem>(), []);

  useDeepDiffEffect(() => {
    if (Array.isArray(cacheOptions)) {
      cacheOptions.forEach(reg => {
        items.forEach(item => {
          const { page = '', cacheId } = item;
          // match 缓存路由
          if (reg.test(page.replace(`:${cacheId}`, '')) && cacheId && !CacheRouteMap.get(page)) {
            CacheRouteMap.set(page, { ...item });
            forceUpdate();
          }
        });
      });
    }
  }, [items, cacheOptions]);

  const genPageItem = (): ReadonlyArray<TItem> => {
    const currentMap = items.filter(t => t.page).reduce((map, item) => ({ ...map, [item.page]: item }), {});
    const copyRouteMap = [...CacheRouteMap.keys()].filter(
      key => !Object.prototype.hasOwnProperty.call(currentMap, key)
    );
    return items.concat(copyRouteMap.map(key => (CacheRouteMap.get(key) || null) as TItem).filter(Boolean));
  };

  return genPageItem().map(renderItem);
}

const PageRoot: React.FC<{ visible: boolean } & PageStackItem> = ({ visible, children, page }) => {
  const [pageRootEl, setPageRootEl] = useState<HTMLElement>();
  const originalContainer = useContext(ContainerContext);

  const container = useMemo(
    () => ({
      ...originalContainer,
      rootVisible: visible,
      rootElement: pageRootEl,
    }),
    [visible, originalContainer, pageRootEl]
  );

  return (
    <>
      <div
        className={classnames('page-root', {
          'page-visible': visible,
        })}
        data-visible={visible}
        data-page={page}
        data-role="page-root"
        ref={setPageRootEl as any}
      />
      {pageRootEl
        ? createPortal(<ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>, pageRootEl)
        : null}
    </>
  );
};

const PageLoader: React.FC<PageStackItem> = ({ page, getPageParams, children }) => {
  const { ComponentLoader } = useContext(ContainerContext);

  if (!page) return children as ReactElement;

  return <ComponentLoader componentURI={page} props={getPageParams()} />;
};

function useHistoryNavigationByPageStack(pageStack: IPageStack): NavigationAbility['navAPI'] {
  const callbackQueue = useMemo<Array<Fn | undefined>>(() => [], []); // Map 会导致多次跳转覆盖前次
  const callbackDataRef = useRef<any>();
  const { history } = window;
  const generateUrl = (page: string, params?: Record<string, any>) => {
    if (isFullUrl(page)) {
      return genFullUrlWithQuery(page, params || {});
    }

    const pageParams = JSON.stringify(params || {}) || '';
    return genFullUrlWithQuery(getCurrentHostAndPath(), {
      ...getQueryForUrl(),
      page,
      pageParams: pageParams.length > 1500 ? 'BLOB' : pageParams,
    });
  };

  function open(page: string, params?: Record<string, any>) {
    if (isFullUrl(page)) {
      window.open(genFullUrlWithQuery(page, params || {}));
    } else {
      window.open(generateUrl(page, params));
    }
  }

  function navigateTo(page: string, params?: Record<string, any>, navigatorOption?: { callbackEvent: Fn }) {
    history.pushState(
      {
        page,
        params,
      },
      document.title,
      generateUrl(page, params)
    );

    pageStack.push({
      page,
      cacheId: getCacheId(page),
      rawPageParams: buildQueryString(params || {}),
      getPageParams: () => params || {},
    });

    callbackQueue.push(navigatorOption ? navigatorOption.callbackEvent : undefined);
  }

  function back() {
    history.back();
  }

  function replace(page: string, params?: Record<string, any>) {
    history.replaceState(
      {
        page,
        params,
      },
      document.title,
      generateUrl(page, params)
    );

    pageStack.replace({
      page,
      cacheId: getCacheId(page),
      rawPageParams: params,
      getPageParams: () => params || {},
    });
  }

  function navigateAndWaitBack(page: string, params: Record<string, any>) {
    return new Promise(resolve => {
      navigateTo(page, params, { callbackEvent: resolve });
    });
  }

  function backWithResponse(data: any) {
    callbackDataRef.current = data;
    back();
  }

  function reload() {
    window.location.reload();
  }

  useEffect(() => {
    const popStateHandle = (event: PopStateEvent) => {
      // 1.pop page stack
      pageStack.pop();
      if (pageStack.size === 0) {
        const pageState = event.state || {};
        pageStack.push({
          page: pageState.page,
          cacheId: getCacheId(pageState.page),
          rawPageParams: pageState.params,
          getPageParams: () => pageState.params,
        });
      }

      // 2.reactive callback event
      const data = callbackDataRef.current;
      callbackDataRef.current = null;
      const fn = callbackQueue.pop();
      if (fn) {
        try {
          fn.call(null, data);
        } catch (err) {
          console.error('invoke route backResponse callback fail', err);
        }
      }
    };
    window.addEventListener('popstate', popStateHandle);
    return () => {
      window.removeEventListener('popstate', popStateHandle);
    };
  }, [callbackQueue]);

  return {
    navigateTo,
    navigateAndWaitBack,

    back,
    backWithResponse,

    replace,
    open,
    reload,
  };
}

/**
 * 数据管控路由层
 */
function useNavigator(): { pageStack: IPageStack; navAPI: NavigationAbility['navAPI'] } {
  const forceRefresh = useForceUpdate();

  const data = useMemo<{ items: PageStackItem[] }>(() => {
    const query: Record<string, any> = getQueryForUrl();
    return {
      items: [
        {
          page: query.page,
          cacheId: getCacheId(query.page),
          rawPageParams: query.pageParams,
          getPageParams: () => safeParseJSON(query.pageParams),
        },
      ],
    };
  }, []);

  const pageStack = useMemo<IPageStack>(
    () => ({
      getStack: () => data.items,
      push: (item: PageStackItem) => {
        data.items.push(item);
        forceRefresh();
      },
      pop: (): PageStackItem | undefined => {
        const preStack = data.items.pop();
        forceRefresh();
        return preStack;
      },
      replace: (item: PageStackItem) => {
        data.items.pop();
        data.items.push(item);
        forceRefresh();
      },
      get size() {
        return data.items.length;
      },
    }),
    [data.items, forceRefresh]
  );

  const navAPI = useHistoryNavigationByPageStack(pageStack);

  return {
    pageStack,
    navAPI,
  };
}

type Fn = (data: any) => void;

function NavigatorContainer(props: ContainerProps): ReactElement {
  const { navAPI, pageStack } = useNavigator();
  const originalContainer = useContext(ContainerContext);
  const container = useMemo(
    () => ({
      ...originalContainer,
      navAPI,
    }),
    [originalContainer]
  );

  return (
    <ContainerContext.Provider value={container}>
      <PageStack<PageStackItem & Pick<ContainerProps, 'cacheOptions'>>
        cacheOptions={props.cacheOptions}
        items={pageStack.getStack()}
        renderItem={(itemProps, idx) => (
          <PageRoot key={itemProps.page || idx} {...itemProps} visible={idx === pageStack.size - 1}>
            <Updatable when={idx === pageStack.size - 1}>
              <PageLoader {...itemProps}>{props.children}</PageLoader>
            </Updatable>
          </PageRoot>
        )}
      />
    </ContainerContext.Provider>
  );
}

export default NavigatorContainer;
