import { ErrorWithCode } from './ErrorWithCode';
import { ErrorCode } from './ErrorCode';

export class InvalidServiceInjection extends ErrorWithCode {
  constructor(public readonly serviceName: string) {
    super(`invalid service "${serviceName}"`, ErrorCode.InvalidServiceInjection);
  }
}
