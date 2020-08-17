import { Status } from 'simple-http-status'

import { CustomError } from './custom-error'

export class NotAuthorised extends CustomError {
  statusCode = Status.HTTP_401_UNAUTHORIZED

  constructor() {
    super('Not authorised')

    Object.setPrototypeOf(this, NotAuthorised.prototype)
  }

  serializeErrors() {
    return [{ message: 'Not authorised' }]
  }
}
