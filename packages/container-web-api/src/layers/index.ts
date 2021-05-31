import BasicLayer from './basic';
import SchemaLayer from './schema/index';
import ServiceLayer from './service/index';
import { LayerIteration } from './interface';

const layers: LayerIteration[] = [BasicLayer, SchemaLayer, ServiceLayer];

export default layers;
