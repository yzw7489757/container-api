import { ReactElement } from "react";
import { ErrorBoundaryAbility } from './errorBoundary';

export interface SuspenseAbility extends ErrorBoundaryAbility {
  /**
   * 自定义加载界面
   */
   renderLoading?: () => ReactElement;
   /**
    * 加载成功的事件
    */
   onLoad?: (componentClass: any) => void;
}