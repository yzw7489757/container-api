import { ErrorWithCode } from './ErrorWithCode';
import { ErrorCode } from './ErrorCode';

export class ServiceNotFoundError extends ErrorWithCode {
  constructor(public readonly serviceName: string) {
    super(`cannot find service "${serviceName}"`, ErrorCode.ServiceNotFound);
  }
}
