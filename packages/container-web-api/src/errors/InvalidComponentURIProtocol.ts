import { ErrorCode } from './ErrorCode';
import { ErrorWithCode } from './ErrorWithCode';

export class InvalidComponentURIProtocol extends ErrorWithCode {
  constructor(public readonly protocol: string | unknown) {
    super(`invalid module URI protocol "${protocol}"`, ErrorCode.InvalidComponentURIProtocol);
  }
}
