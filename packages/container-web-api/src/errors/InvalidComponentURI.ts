import { ErrorCode } from './ErrorCode';
import { ErrorWithCode } from './ErrorWithCode';

export class InvalidModuleURIError extends ErrorWithCode {
  constructor(public readonly moduleURI: string | unknown) {
    super(`invalid module URI "${moduleURI}"`, ErrorCode.InvalidModuleURI);
  }
}
