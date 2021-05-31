import { ContainerAbility, ContainerOptions } from '@iron-man/container-api';
import createCustomServicePortal from './createCustomService';
import createServicePortal from './createServicePortal';

function ServiceLayer(origin: ContainerAbility, options: ContainerOptions) {
  return {
    ...origin,
    service: {
      ...createServicePortal(origin, options),
      ...createCustomServicePortal(origin, options),
    },
  };
}

export default ServiceLayer;
