import { ErrorWithCode } from './ErrorWithCode';
import { ErrorCode } from './ErrorCode';

export class CantGetModuleInfo extends ErrorWithCode {
  constructor(public readonly componentURI: string) {
    super(`cannot find service "${componentURI}"`, ErrorCode.CantGetModuleInfo);
  }
}
