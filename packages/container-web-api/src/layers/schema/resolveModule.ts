import { ContainerOptions, ModuleType, EnvTypeEnum } from '@iron-man/container-api';
import { InvalidModuleURIError } from '../../errors/InvalidComponentURI';
import { InvalidComponentURIProtocol } from '../../errors/InvalidComponentURIProtocol';

enum ProtocolEnum {
  http = 'http',
  https = 'https',
  cdn = 'cdn',
  group = 'group',
  internal = 'internal'
}

type moduleURIInfo = {
  protocol: string; // 协议
  path: string; // 文件路径
  subPath: string; // 模块路径
  componentURI: string; // 完整路径，用于可能地址映射版本
  cacheId: string; // 缓存
};

const URIReg = /^([\a-z0-9_-]+):\/\//;
function parseURI(componentURI: string, options: ContainerOptions): moduleURIInfo {
  URIReg.lastIndex = 0;
  const result = componentURI.match(URIReg);

  if (!result && options.baseModuleURI) {
    return parseURI(options.baseModuleURI + componentURI, options);
  }
  if (!result) {
    throw new InvalidModuleURIError(componentURI);
  }
  const protocol = result[1] as ProtocolEnum;
  let uri = componentURI.substring(protocol.length + 3 /* :// */);
  let subPath = '';
  let cacheId = '';
  let subPathIdx = uri.indexOf('#');
  if (subPathIdx > 0) {
    subPath = uri.substring(subPathIdx + 1); // e.g. ://assets/index.js#Header
    uri = uri.substring(0, subPathIdx);
  }
  let cacheIdx = subPath.indexOf(':');
  if (cacheIdx > 0) {
    cacheId = subPath.substring(cacheIdx + 1);
    subPath = subPath.substring(0, cacheIdx); // e.g. ://assets/index.js#Header
  }
  return {
    protocol,
    path: uri,
    subPath,
    componentURI,
    cacheId,
  };
}

function getAliCdnHost(envType: EnvTypeEnum) {
  return envType === 'pre-online' || envType === 'daily' ? 'dev.g.alicdn.com' : 'g.alicdn.com';
}

// function getModuleVersion(uriInfo: moduleURIInfo, options: ContainerOptions) {
//   const result = uriInfo.path.match(/(\d+\.\d+\.+\d+)/);
//   if (result && result[1]) {
//     return result[1];
//   } else if (options.moduleVersion) {
//     return options.moduleVersion[uriInfo.componentURI] || options.moduleVersion[uriInfo.path];
//   }
//   return null;
// }

function parseCdnModule(uriInfo: moduleURIInfo, options: ContainerOptions): ModuleType {
  const cdnHost = getAliCdnHost(options.envType || 'online');
  // const version = getModuleVersion(uriInfo, options);
  if (!uriInfo.path) {
    throw new Error('path muse accord with cdn rules');
  }
  return {
    type: 'remote',
    url: `https://${cdnHost}/${uriInfo.path}.js`,
    exportName: uriInfo.subPath,
  };
}

function parseRemoteModule(uriInfo: moduleURIInfo, options: ContainerOptions): ModuleType {
  // const version = getModuleVersion(uriInfo, options)
  if (!uriInfo.path) {
    throw new Error('path muse accord with remote module rules');
  }
  return {
    type: 'remote',
    url: `${uriInfo.path.startsWith('http') ? uriInfo.path : 'https://'}${uriInfo.path}.js`,
    exportName: uriInfo.subPath,
    format: 'UMD',
  };
}

function parseGroupModule(uriInfo: moduleURIInfo, options: ContainerOptions): ModuleType {
  // custom rule for group ...
  return {
    type: 'remote',
    url: `https://0.0.0.0:8082/${uriInfo.path}.js`,
    exportName: uriInfo.subPath,
    format: 'UMD',
  };
}

/**
 *
 * @param componentURI
 * @param options
 */
export default function resolveModule(componentURI: string, options: ContainerOptions): ModuleType {
  const uriInfo = parseURI(componentURI, options);

  switch (uriInfo.protocol) {
    case ProtocolEnum.cdn: {
      return parseCdnModule(uriInfo, options);
    }
    case ProtocolEnum.http:
    case ProtocolEnum.https: {
      return parseRemoteModule(uriInfo, options);
    }
    case ProtocolEnum.group: {
      return parseGroupModule(uriInfo, options);
    }
    case ProtocolEnum.internal: {
      return Reflect.get(options.modules || {}, uriInfo.path)
    }
    default: {
      throw new InvalidComponentURIProtocol(uriInfo.protocol);
    }
  }
}
