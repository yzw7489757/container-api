import { noop } from './index';

class ImportScript {
  script: HTMLScriptElement;
  constructor(){
    this.script = document.createElement('script');
  }

  load = function() {
    function cleanup() {
      this.script.onload = null;
      this.script.onerror = noop;
    }
    return new Promise<void>((resolve, reject) => {
      this.script.onload = function() {
        resolve();
        cleanup();
      };
      this.script.onerror = function() {
        reject();
        cleanup();
      };
      document.head.appendChild(this.script);
    });
  };

  setUrl = (url: string) =>{
    this.script.setAttribute("src", url);
    return this;
  };

  setAttrs = function(attrs: Record<string, string>) {
    Object.keys(attrs).forEach(key => {
      this.script.setAttribute(key, attrs[key]);
    });
    return this;
  };
}


export default ImportScript;
