import URLParse from 'url-parse';
import debug from 'debug';

const urlDeg = debug('genURL');
urlDeg.enabled = true;

type QueryUrlParamsType = Record<string, string | number>;
type BuildQueryStringOptions = {
  encode?: boolean;
};

function isObjectWithWarning<T>(obj: T, warnMsg: string): T {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    urlDeg(warnMsg);
  }
  return obj;
}

/**
 * 格式化字符对象, object to string
 * @param params
 * @param options
 * @returns
 */
export function buildQueryString(params: QueryUrlParamsType, options?: BuildQueryStringOptions): string {
  const { encode = true } = options || {};
  const encodeHandle = encode ? encodeURIComponent : ((d: string) => d);
  return Object.keys(params)
    .map(
      key =>
        `${encodeHandle(key)}=${encodeHandle(
          isObjectWithWarning(params[key], `${key} is Object but url string not supported`)
        )}`
    )
    .join('&');
}

/**
 * 获取当前href的查询字符串
 * @returns
 */
export function getQueryForUrl() {
  return new URLParse(window.location.href, true).query;
}

/**
 * 获取当前地址，排除掉 query
 * @returns {string}
 */
export function getCurrentHostAndPath(): string {
  return window.location.href.replace(/[?#].*$/, '');
}

/**
 * 判断url是否完整网址，仅判断是否协议 or //www.xxx.com
 * @param url
 * @returns {boolean}
 */
export function isFullUrl(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}

export function genFullUrlWithQuery(path: string, params: QueryUrlParamsType, options?: BuildQueryStringOptions) {
  let queryString = buildQueryString(params, options);
  if (!queryString) {
    return path;
  }
  return path + (path.indexOf('?') >= 0 ? '&' : '?') + queryString;
}
