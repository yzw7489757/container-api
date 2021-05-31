export interface NavigationAbility {
  navAPI: {
    navigateTo(page: string, params?: Record<string, any>): void;
    back(): void;
  
    navigateAndWaitBack(page: string, params?: Record<string, any>): Promise<any>;
    backWithResponse(data: any): void;
  
    replace(page: string, params?: Record<string, any>): void;
  
    open(page: string, params?: Record<string, any>): void;
    reload(): void;
  }
}