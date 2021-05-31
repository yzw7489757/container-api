export interface TipUtils {
  alert: () => void;
  confirm: () => void;
  toast: () => void;
}

export interface StorageApi {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
  getJSON: <T = unknown>(key: string) => Promise<T | null>;
  setJSON: <T = unknown>(key: string, value: T) => Promise<void>;
}

export interface PracticalUtils {
  // 预览图片
  previewImage: (text: string) => void,
  // 复制到剪切板
  copyToClipboard: (text: string) => Promise<void>
};

export interface BasicLayerAbility extends TipUtils {
  /**
   * 本地存储
   */
  storage: StorageApi
  /**
  * 实用工具
  */
  utils: PracticalUtils
}