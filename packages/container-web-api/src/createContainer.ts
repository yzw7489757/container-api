import layers from './layers/index';
import { ContainerAbility, ContainerOptions } from '@iron-man/container-api'

export function createContainer(originContainer: ContainerAbility, options: ContainerOptions) {
  return layers.reduce((preContainer, layer) => layer(preContainer, options), originContainer);
}
