export function newUnimplementedError() {
  return new Error('not implemented');
}

export function unimplementedFunction(...args: any[]): any {
  throw newUnimplementedError();
}

export function unimplementedAsyncFunction() {
  return Promise.reject(newUnimplementedError());
}

export const unimplementedComponent: React.ComponentType<any> = (): any => {
  throw newUnimplementedError();
};
