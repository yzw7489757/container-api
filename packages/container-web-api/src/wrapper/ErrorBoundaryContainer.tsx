import React, { ReactElement, Component, ErrorInfo, ComponentType, createElement } from 'react';
import { ContainerProps } from '@iron-man/container-api';
import { BaseProps } from '../types/BaseProps';

export interface ErrorBoundary {
  reset(): void;
}

export interface ErrorBoundaryProps<TError = any> extends BaseProps<ErrorBoundary> {
  onError?: (error: TError) => void;
  renderError?: ComponentType<ErrorRenderHelp>;
}

export type ErrorRenderHelp = {
  error: any;
  enableReload?: boolean;
  reset: () => void;
};

function DefaultErrorRenderHelp({ error, enableReload, reset }: ErrorRenderHelp) {
  return (
    <div className="error-help">
      <div className="error-detail">{error}</div>
      {enableReload && (
        <div className="error-handle">
          <button type="button" onClick={reset}>
            再试一次
          </button>
        </div>
      )}
    </div>
  );
}

interface State<TError> {
  hasError?: boolean;
  error?: TError;
}

export class ErrorBoundaryWrapper<TError extends Error = Error> extends Component<
  ErrorBoundaryProps<TError>,
  State<TError>
> {
  state = {
    hasError: false,
    error: undefined,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    if (onError) {
      onError(error as TError);
    }

    this.setState({
      hasError: true,
      error: error as TError,
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  };

  render() {
    const { children, renderError } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error !== undefined) {
      return React.createElement(renderError || DefaultErrorRenderHelp, {
        error,
        enableReload: true,
        reset: this.reset,
      });
    } else {
      return children;
    }
  }
}

/**
 * 基础容器层
 * @param props @type {ContainerProps}
 * @returns
 */
const ErrorBoundaryContainer: React.FC<ContainerProps> = props => {
  const { children, withErrorBoundary } = props;

  if (withErrorBoundary === true || withErrorBoundary === undefined) {
    return <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>;
  }

  if (typeof withErrorBoundary === 'function') {
    return createElement(withErrorBoundary, {}, children);
  }

  return children as ReactElement;
};

export default ErrorBoundaryContainer;
