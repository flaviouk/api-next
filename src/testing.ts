import { createMocks, RequestOptions, ResponseOptions } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'

import { createService } from './services'

interface ServiceResponse<T = any> {
  statusCode: number
  data: T
  req: NextApiRequest
  res: NextApiResponse
}

export const testService = async <Response>(
  service: ReturnType<typeof createService>,
  reqOptions: RequestOptions,
  resOptions?: ResponseOptions,
): Promise<ServiceResponse<Response>> => {
  const { req, res } = createMocks(reqOptions, resOptions)
  await service(req, res)

  return {
    statusCode: res._getStatusCode(),
    data: JSON.parse(res._getData()),
    req,
    res,
  }
}
