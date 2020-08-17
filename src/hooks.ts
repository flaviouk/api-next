import { body, query, cookie, validationResult } from 'express-validator'

import { Hook } from './api'
import { DatabaseConnectionError } from './errors/database-connection-error'
import { RequestValidationError } from './errors/request-validation-error'
import { DatabaseConnection } from './types'

const cachedDb = {}

export const connectToDatabase = ({
  name,
  connect,
}: DatabaseConnection): Hook => async (req) => {
  try {
    if (!cachedDb[name]) {
      await connect()

      cachedDb[name] = true
    }
    return req
  } catch (err) {
    throw new DatabaseConnectionError()
  }
}

type Validator = ReturnType<typeof body | typeof query | typeof cookie>

interface Validators {
  body: typeof body
  query: typeof query
  cookie: typeof cookie
}

type CreateValidators = (validators: Validators) => Validator[]

export const validateRequest = (
  createValidators: CreateValidators,
): Hook => async (req) => {
  const noop = () => {}
  const validators = createValidators({ body, query, cookie })
  for (let index = 0; index < validators.length; index++) {
    await validators[index](req, noop, noop)
  }

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array())
  }
  return req
}
