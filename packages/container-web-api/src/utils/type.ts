
export function isFunction(x: any): x is Function {
  return typeof x === 'function';
}

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export function isPromiseAlike<T = any>(x: any): x is PromiseLike<T> {
  return x && typeof x === 'object' && isFunction(x.then) && isFunction(x.catch);
}
