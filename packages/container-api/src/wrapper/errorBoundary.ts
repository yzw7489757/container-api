export type ErrorBoundaryAbility = {
  /**
    * 出错的事件（包括加载出错和渲染出错）
    */
  onError?: (error: any, type: 'load' | 'render') => void;
  /**
    * 自定义失败页面
    */
  renderError?: (error: any, type: 'load' | 'render') => React.ReactNode;
}