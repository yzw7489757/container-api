import React, { ReactElement, FC } from 'react';
import { ContainerProps } from '@iron-man/container-api';
import BasicContainer from './BasicContainer';
import NavigatorContainer from './NavigatorContainer';
import SuspenseContainer from './SuspenseContainer';
import ErrorBoundaryContainer from './ErrorBoundaryContainer';

// const wrappers = [BasicContainer, ErrorBoundaryContainer, SuspenseContainer, NavigatorContainer];

export const Container: FC<ContainerProps> = ({ children, ...props }) => (
  <BasicContainer {...props}>
    <NavigatorContainer {...props}>
      <ErrorBoundaryContainer {...props}>
        <SuspenseContainer {...props}>{children}</SuspenseContainer>
      </ErrorBoundaryContainer>
    </NavigatorContainer>
  </BasicContainer>
);

export function CustomContainer(props: ContainerProps): ReactElement {
  return (
    <BasicContainer {...props}>
      <ErrorBoundaryContainer {...props}>
        <NavigatorContainer {...props}>{props.children}</NavigatorContainer>
      </ErrorBoundaryContainer>
    </BasicContainer>
  );
}
