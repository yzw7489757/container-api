import { ContainerAbility, ContainerOptions } from '@iron-man/container-api';

function BasicLayer(origin: ContainerAbility, options: ContainerOptions): ContainerAbility {
  return {
    ...origin,
  };
}

export default BasicLayer;
