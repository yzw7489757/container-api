import { createContext } from 'react';

import { BasicLayerAbility, ServiceLayerAbility, SchemaLayerAbility, NavigationAbility, ContainerContext } from '@iron-man/container-api';

import {
    unimplementedAsyncFunction,
    unimplementedFunction,
    unimplementedComponent,
  } from './utils/initialFunction';
  
const defaultBasicAbility: BasicLayerAbility = {
  alert: unimplementedFunction,
  confirm: unimplementedFunction,
  toast: unimplementedFunction,

  storage: {
    get: unimplementedAsyncFunction,
    set: unimplementedAsyncFunction,
    del: unimplementedAsyncFunction,
    getJSON: unimplementedAsyncFunction,
    setJSON: unimplementedAsyncFunction,
  },

  utils: {
    previewImage: unimplementedAsyncFunction,
    copyToClipboard: unimplementedAsyncFunction,
  }
};

const defaultSchema: SchemaLayerAbility = {
  ComponentLoader: unimplementedComponent,
  preLoadComponent: unimplementedFunction,
}
 
const defaultService: ServiceLayerAbility = {
  service: {
    request: unimplementedAsyncFunction,
    jsonp: unimplementedAsyncFunction,

    getService: unimplementedFunction,
    getCustomService: unimplementedFunction,
    injectCustomService: unimplementedFunction,
  }
};

const defaultNavigation: NavigationAbility = {
  navAPI: {
    navigateTo: unimplementedFunction,
    back: unimplementedFunction,

    navigateAndWaitBack: unimplementedFunction,
    backWithResponse: unimplementedFunction,

    open: unimplementedFunction,
    replace: unimplementedFunction,
    reload: unimplementedFunction,
  }
};

export const containerContext: ContainerContext = createContext({
  ...defaultBasicAbility,
  ...defaultSchema,
  ...defaultService,
  ...defaultNavigation
});