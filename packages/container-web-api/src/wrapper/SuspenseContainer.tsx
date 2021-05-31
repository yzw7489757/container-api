import React, {
  ReactNode,
  useState,
  useRef,
  useCallback,
  Suspense as OriginSuspense,
  createElement,
  ReactElement,
} from 'react';
import Loading from '@/components/Loading';
import { ContainerProps } from '@iron-man/container-api';
import { BaseProps } from '@/types/BaseProps';
import { ErrorBoundaryWrapper } from './ErrorBoundaryContainer';
import { isPromiseAlike } from '@/utils/type';

export interface SuspenseProps extends BaseProps<{}> {
  fallback: NonNullable<ReactNode> | ReactElement | null;
}

const MockSuspenseWrapper = (props: SuspenseProps) => {
  const { fallback, children } = props;
  const [rejected, setRejected] = useState<any>(null);
  const promiseIdRef = useRef(0);
  /**
   * lazy 变动会 throw 出一个 Promise
   */
  const errorBoundaryRef = useRef<ErrorBoundaryWrapper>(null);

  const reset = useCallback(() => {
    promiseIdRef.current = 0;
    setRejected(null);
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.reset();
    }
  }, []);

  const handleError = useCallback((boundaryError: any) => {
    // Error or not Promise, judge fail
    if (boundaryError instanceof Error || !isPromiseAlike(boundaryError)) {
      throw boundaryError;
    }

    // the promise
    const thePromise = boundaryError;
    promiseIdRef.current = Date.now() + Math.random();
    const thePromiseId = promiseIdRef.current;

    // promise only
    thePromise.then(
      () => {
        setTimeout(() => {
          if (thePromiseId === promiseIdRef.current) {
            reset();
          }
        }, 0);
      },
      (err: any) => {
        if (thePromiseId === promiseIdRef.current) {
          setRejected(err);
        }
      }
    );
  }, []);

  const renderFallback = useCallback(() => fallback as ReactElement, [fallback]);

  if (rejected) {
    throw rejected;
  }

  return OriginSuspense ? (
    <OriginSuspense fallback={renderFallback}>{children}</OriginSuspense>
  ) : (
    <ErrorBoundaryWrapper ref={errorBoundaryRef} onError={handleError} renderError={renderFallback}>
      {children}
    </ErrorBoundaryWrapper>
  );
};

export const Suspense = OriginSuspense || MockSuspenseWrapper;

/**
 * 基础容器层
 * @param props @type {ContainerProps}
 * @returns
 */
const SuspenseContainer: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { children, withSuspense,  } = props;

  if (withSuspense === true || withSuspense === undefined) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
  }

  if (typeof withSuspense === 'function') {
    return createElement(withSuspense, { fallback: <Loading /> }, children);
  }
  return children as ReactElement;
};

export default SuspenseContainer;

// interface CustomSuspenseChild {
//   node: Promise<any>;
// }
// 更像是 LazyLoad
// function ComponentThatThrowResolvedPromise(path) {
//   const [throwed, setThrow] = useState(false);
//   const [node, setNode] = useState(null);

//   if (!throwed) {
//     throw new Promise<void>((res, rej) => {
//       setThrow(true);
//       import(path).then(t => {
//         res();
//         return t.default;
//       });
//     });
//   }

//   return node;
// }

// interface CustomSuspenseState {
//   pending: boolean;
//   error?: any;
// }

// class CustomSuspense extends React.Component<SuspenseProps, CustomSuspenseState> {
//   private mounted = false;

//   public state: CustomSuspenseState = {
//     pending: false,
//   };

//   public componentDidMount() {
//     this.mounted = true;
//   }

//   public componentDidUpdate() {
//     if (this.state.pending && this.state.error) {
//       throw this.state.error;
//     }
//   }

//   public componentDidCatch(err: any) {
//     if (!this.mounted) {
//       return;
//     }

//     if (isPromiseAlike(err)) {
//       this.setState({ pending: true });
//       err
//         .then(() => {
//           this.setState({ pending: false });
//         })
//         .catch(_err => {
//           this.setState({ error: _err || new Error('Suspense Error') });
//         });
//     } else {
//       throw err;
//     }
//   }

//   public componentWillUnmount() {
//     this.mounted = false;
//   }

//   public render() {
//     return this.state.pending ? this.props.fallback : this.props.children;
//   }
// }

// <Suspense fallback={<div>loading...</div>}>
//   <ComponentThatThrowResolvedPromise />
// </Suspense>
