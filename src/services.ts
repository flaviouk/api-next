import { NextApiRequest, NextApiResponse } from 'next'
import morgan from 'morgan'
import { Method, Status } from 'simple-http-status'

import { CustomError } from './errors/custom-error'
import { NotFoundError } from './errors/not-found-error'
import { Hook, ServiceMethods } from './types'

interface Pk {
  name?: string
  cast?: (pk: string) => string
}

interface Hooks {
  all?: Hook[]
  find?: Hook[]
  create?: Hook[]
  get?: Hook[]
  update?: Hook[]
  patch?: Hook[]
  remove?: Hook[]
}

interface ServiceOptions extends ServiceMethods {
  pk?: Pk
  hooks?: {
    before?: Hooks
    after?: Hooks
  }
}

const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
)

const getPk = (pk: Pk = {}, query: NextApiRequest['query']): string | null => {
  const queryValue = pk?.name ? query[pk?.name] : query?.id || query?.pk
  const [value] = Array.isArray(queryValue) ? queryValue : [queryValue]
  return pk?.cast && value ? pk.cast(value!) : value
}

const getStatusCode = (type: keyof ServiceMethods) => {
  switch (type) {
    case 'create':
      return Status.HTTP_201_CREATED
    default:
      return Status.HTTP_200_OK
  }
}

const runHandler = async (
  type: keyof ServiceMethods,
  options: ServiceOptions,
  req: NextApiRequest,
  pk: string,
) => {
  switch (type) {
    case 'find':
      return options.find!(req.query)
    case 'create':
      return options.create!(req.body)
    case 'get':
      return options.get!(pk, req.query)
    case 'update':
      return options.update!(pk, req.body, req.query)
    case 'patch':
      return options.patch!(pk, req.body, req.query)
    case 'remove':
      return options.remove!(pk)
  }
}

const handleService = async (
  type: keyof ServiceMethods,
  options: ServiceOptions,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const pk = getPk(options.pk, req.query)

  const runHooks = async (hooks: Hook[]) => {
    for (let index = 0; index < hooks.length; index++) {
      await hooks[index](req, res, () => {})
    }
  }

  const allBeforeHooks = options.hooks?.before?.all ?? []
  const beforeHooks = options.hooks?.before?.[type] ?? []
  await runHooks([...allBeforeHooks, ...beforeHooks])

  const result = await runHandler(type, options, req, pk!)

  const allAfterHooks = options.hooks?.after?.all ?? []
  const afterHooks = options.hooks?.after?.[type] ?? []
  await runHooks([...allAfterHooks, ...afterHooks])

  const statusCode = getStatusCode(type)

  return res.status(statusCode).json(result)
}

export const createService = (options: ServiceOptions) => async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  logger(req, res, () => {})

  try {
    const pk = getPk(options.pk, req.query)
    const { method } = req

    switch (true) {
      case options.get && pk && method === Method.GET:
        return handleService('get', options, req, res)

      case options.update && pk && method === Method.PUT:
        return handleService('update', options, req, res)

      case options.patch && pk && method === Method.PATCH:
        return handleService('patch', options, req, res)

      case options.remove && pk && method === Method.DELETE:
        return handleService('remove', options, req, res)

      case options.find && !pk && method === Method.GET:
        return handleService('find', options, req, res)

      case options.create && !pk && method === Method.POST:
        return handleService('create', options, req, res)

      default:
        throw new NotFoundError()
    }
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({
        errors: err.serializeErrors(),
      })
    }

    return res.status(Status.HTTP_500_INTERNAL_SERVER_ERROR).json({
      errors: [{ message: 'Something went wrong' }],
    })
  }
}
