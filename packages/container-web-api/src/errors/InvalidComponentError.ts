
import { ErrorWithCode } from './ErrorWithCode';
import { ErrorCode } from './ErrorCode';

export class InvalidComponentError extends ErrorWithCode {
  constructor(public readonly componentURI: string, ModuleName: string) {
    super(`Unable render component #${ModuleName} in "${componentURI}"`, ErrorCode.InvalidComponentError);
  }
}