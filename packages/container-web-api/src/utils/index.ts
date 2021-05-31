export function noop(){
  // 
}
export function sleep(ms: number) {
  return new Promise(function(resolve) {
    return setTimeout(resolve, ms);
  });
}

export function safeParseJSON(params: any): any {
  if (typeof params === 'object') {
    return params || {};
  }

  if (!params || params === 'null' || params === 'undefined') {
    return {};
  }

  try {
    return JSON.parse(params) || {};
  } catch (e) {
    console.error('failed to parse page params: ', e);
    return {};
  }
}
