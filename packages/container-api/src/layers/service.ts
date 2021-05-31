export type CustomFetchInnerOptions = {
  envHost?: Record<string, string>;
  timeout?: number;
  [x: string]: any;
}

export type ServiceLayerAbility = {
  service: {
    request: TypeRequest,
    jsonp: TypeRequest,
    getService: (serviceName: string) => CustomFetcher | TypeRequest | null,
    getCustomService: <T extends CustomFetcher>(serviceName: string, defaultService?: T) => CustomFetcher,
    injectCustomService: (serviceName: string, fetcher: CustomFetcher, innerOptions?: CustomFetchInnerOptions) => Promise<void>
  }
}

export type CustomFetcher = <T = unknown>(url: string, ...args: any[]) => Promise<T>;
export type TypeRequest = <T = unknown>(url: string, data: any, options: any) => Promise<T>;