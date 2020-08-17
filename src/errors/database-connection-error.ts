import { Status } from 'simple-http-status'

import { CustomError } from './custom-error'

export class DatabaseConnectionError extends CustomError {
  statusCode = Status.HTTP_500_INTERNAL_SERVER_ERROR
  reason = 'Error connecting to database'

  constructor() {
    super('Error connecting to database')

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reason }]
  }
}
