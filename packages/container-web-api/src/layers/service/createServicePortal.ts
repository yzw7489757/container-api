import { ContainerAbility, ContainerOptions, ServiceLayerAbility, CustomFetcher, TypeRequest } from '@iron-man/container-api';
import createRequestService from './request';
import createJsonpService from './jsonp';

function createServicePortal(
  origin: ContainerAbility,
  options: ContainerOptions
): Pick<ServiceLayerAbility['service'], 'jsonp' | 'request' | 'getService'> {
  const Request = createRequestService(options.envType || 'online');
  const Jsonp = createJsonpService(options.envType || 'online');

  const presetServices = {
    request: Request,
    jsonp: Jsonp,
  };

  const getService = (name: string): TypeRequest | CustomFetcher | null => {
    if (Object.prototype.hasOwnProperty.call(presetServices, name)) {
      return presetServices[name as keyof typeof presetServices];
    } else if (typeof name === 'string') {
      return origin.service.getCustomService(name)
    }else {
      return null
    }
  };

  return {
    ...presetServices,
    getService,
  };
}

export default createServicePortal;
