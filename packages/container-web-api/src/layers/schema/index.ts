import { ContainerAbility, ContainerOptions } from '@iron-man/container-api';
import { createComponentLoader } from './createComponentLoader';

function SchemaLayer(origin: ContainerAbility, options: ContainerOptions): ContainerAbility {
  const { ComponentLoader, preLoadComponent } = createComponentLoader(origin, options);

  return {
    ...origin,
    ComponentLoader,
    preLoadComponent,
  };
}

export default SchemaLayer;
