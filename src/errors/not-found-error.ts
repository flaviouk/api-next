import { Status } from 'simple-http-status'

import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
  statusCode = Status.HTTP_404_NOT_FOUND

  constructor() {
    super('Route not found')

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors() {
    return [{ message: 'Not Found' }]
  }
}
