import { ErrorCode } from './ErrorCode';

export class ErrorWithCode extends Error {
  constructor(message: string, public readonly code: ErrorCode = ErrorCode.Unknown, public readonly detail?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
