import { NextApiRequest, NextApiResponse } from 'next'
import morgan from 'morgan'
import { Status, Method } from 'simple-http-status'

import { CustomError } from 'errors/custom-error'
import { NotFoundError } from 'errors/not-found-error'
import { Services, Hook } from 'types'

interface Pk {
  name?: string
  cast?: (pk: string) => string
}

interface NextApiOptions extends Services {
  pk?: Pk
  hooks?: {
    all?: Hook[]
    find?: Hook[]
    create?: Hook[]
    get?: Hook[]
    update?: Hook[]
    patch?: Hook[]
    remove?: Hook[]
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

export const createApi = (options: NextApiOptions) => async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  logger(req, res, () => {})

  try {
    const allHooks = options.hooks?.all ?? []

    const runHooks = async (hooks: Hook[]) => {
      for (let index = 0; index < hooks.length; index++) {
        await hooks[index](req, res, () => {})
      }
    }

    const pk = getPk(options.pk, req.query)
    const { method } = req

    if (options.get && pk && method === Method.GET) {
      const hooks = options.hooks?.get ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.get(pk, req.query)
      return res.status(Status.HTTP_200_OK).json(result)
    }

    if (options.update && pk && method === Method.PUT) {
      const hooks = options.hooks?.update ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.update(pk, req.body, req.query)
      return res.status(Status.HTTP_200_OK).json(result)
    }

    if (options.patch && pk && method === Method.PATCH) {
      const hooks = options.hooks?.patch ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.patch(pk, req.body, req.query)
      return res.status(Status.HTTP_200_OK).json(result)
    }

    if (options.remove && pk && method === Method.DELETE) {
      const hooks = options.hooks?.remove ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.remove(pk)
      return res.status(Status.HTTP_200_OK).json(result)
    }

    if (options.find && !pk && method === Method.GET) {
      const hooks = options.hooks?.find ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.find(req.query)
      return res.status(Status.HTTP_200_OK).json(result)
    }

    if (options.create && !pk && method === Method.POST) {
      const hooks = options.hooks?.create ?? []
      await runHooks([...allHooks, ...hooks])
      const result = await options.create(req.body)
      return res.status(Status.HTTP_201_CREATED).json(result)
    }

    throw new NotFoundError()
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
