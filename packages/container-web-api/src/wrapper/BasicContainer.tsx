import React, { useContext, useMemo } from 'react';
import { ContainerProps } from '@iron-man/container-api';
import { containerContext as ContainerContext } from '@/containerContext';
import { createContainer } from '@/createContainer';
import { useSafeTrackingRef } from '../utils/hook';

/**
 * 基础容器层
 * @param props
 * @returns
 */
function BasicContainer(props: ContainerProps) {
  const { children, ...restProps } = props;
  const propsRef = useSafeTrackingRef(restProps);
  const originContext = useContext(ContainerContext);
  const value = useMemo(() => createContainer(originContext, propsRef.current), []);
  return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>;
}

export default BasicContainer;
