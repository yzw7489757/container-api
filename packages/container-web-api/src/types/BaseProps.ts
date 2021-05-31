import { Ref, MutableRefObject, CSSProperties } from 'react';

export interface BaseProps<TRef = any> {
  key?: string | number | any;
  ref?: Ref<TRef> | MutableRefObject<TRef>;
  className?: string;
  style?: CSSProperties;
  children?: any;
}