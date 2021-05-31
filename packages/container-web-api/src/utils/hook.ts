import { useRef, useEffect, useMemo, DependencyList, useState, useCallback } from 'react';
import { isEqual } from 'lodash';

// 比对fields发生变化
export const useDeepDiffEffect = <T = any>(cb: () => void, fields: T, comparisonFn = isEqual) => {
  const pre = useRef<T>();

  if (!pre.current || comparisonFn(fields, pre.current)) {
    pre.current = fields;
  }

  return useEffect(cb, [pre.current]);
};

// 比对fields发生变化
export const useDeepMemo = <T = any>(cb: () => T, deps: DependencyList, comparisonFn = isEqual) => {
  const pre = useRef<DependencyList>();

  if (!pre.current || comparisonFn(deps, pre.current)) {
    pre.current = deps;
  }

  return useMemo(cb, [pre.current]);
};

export function useSafeTrackingRef(t: any) {
  let ref = useRef(t);
  useEffect(
    function() {
      ref.current = t;
    },
    [t]
  );
  return ref;
}


export function useForceUpdateWithKey(): [string, () => void] {
  const [key, forceUpdate] = useState('');
  return [key, useCallback(() => forceUpdate(Math.random().toString(36)), [])];
}

export function useForceUpdate() {
  return useForceUpdateWithKey()[1];
}

export const usePrevious = <T = unknown>(data: T, defaultValue?: any): T => {
  const v = useRef<T>();
  useEffect(() => {
    v.current = data;
  });
  return v.current === undefined || v.current === null ? defaultValue : v.current;
};

const _globalKey = '__react-context-key__';

export function gud() {
  // eslint-disable-next-line no-return-assign
  return (window[_globalKey] = (window[_globalKey] || 0) + 1);
}
