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

export const createService = (options: ServiceOptions) => async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  logger(req, res, () => {})

  try {
    const pk = getPk(options.pk, req.query)
    const method = req.method?.toUpperCase()

    const runHooks = async (hooks: Hook[]) => {
      for (let index = 0; index < hooks.length; index++) {
        await hooks[index](req, res, () => {})
      }
    }

    switch (true) {
      case 'get' in options && pk && method === Method.GET: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.get ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.get!(pk!, req.query)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.get ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_200_OK).json(result)
      }

      case 'update' in options && pk && method === Method.PUT: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.update ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.update!(pk!, req.body, req.query)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.update ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_200_OK).json(result)
      }

      case 'patch' in options && pk && method === Method.PATCH: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.patch ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.patch!(pk!, req.body, req.query)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.patch ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_200_OK).json(result)
      }

      case 'remove' in options && pk && method === Method.DELETE: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.remove ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.remove!(pk!)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.remove ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_200_OK).json(result)
      }

      case 'find' in options && !pk && method === Method.GET: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.find ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.find!(req.query)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.find ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_200_OK).json(result)
      }

      case 'create' in options && !pk && method === Method.POST: {
        const allBeforeHooks = options.hooks?.before?.all ?? []
        const beforeHooks = options.hooks?.before?.create ?? []
        await runHooks([...allBeforeHooks, ...beforeHooks])

        const result = await options.create!(req.body)

        const allAfterHooks = options.hooks?.after?.all ?? []
        const afterHooks = options.hooks?.after?.create ?? []
        await runHooks([...allAfterHooks, ...afterHooks])

        return res.status(Status.HTTP_201_CREATED).json(result)
      }

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
