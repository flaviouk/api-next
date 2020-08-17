import { Status } from 'simple-http-status'

import { CustomError } from './custom-error'

export class BadRequestError extends CustomError {
  statusCode = Status.HTTP_400_BAD_REQUEST

  constructor(public message: string) {
    super(message)

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  serializeErrors() {
    return [{ message: this.message }]
  }
}
