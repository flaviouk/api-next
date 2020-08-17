import { Status } from 'simple-http-status'
import { ValidationError } from 'express-validator'

import { CustomError } from './custom-error'

export class RequestValidationError extends CustomError {
  statusCode = Status.HTTP_400_BAD_REQUEST

  constructor(public errors: ValidationError[]) {
    super('Invalid parameters')

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors() {
    return this.errors.map((error) => ({
      message: error.msg,
      field: error.param,
    }))
  }
}
