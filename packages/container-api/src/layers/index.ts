import { ContainerProps } from '../ContainerProps';
import { BasicLayerAbility } from './basic';
import { ServiceLayerAbility } from './service';
import { SchemaLayerAbility } from './schema';
import { NavigationAbility } from '../wrapper/navigation';

export type ContainerOptions = Omit<ContainerProps, 'children'>

export type ContainerAbility = BasicLayerAbility & ServiceLayerAbility & SchemaLayerAbility & NavigationAbility;