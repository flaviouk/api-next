import { Method, Status } from 'simple-http-status'

import { createService, testService, NotAuthorised } from '../src'

describe('[errors/generic]', () => {
  test('Should return error object', async () => {
    const service = createService({
      hooks: {
        before: {
          get: [
            async () => {
              throw new NotAuthorised()
            },
          ],
        },
      },
      get: async () => ({
        hello: 'there',
      }),
    })
    const { statusCode, data } = await testService(service, {
      method: Method.GET,
      query: { id: '1' },
    })
    expect(statusCode).toBe(Status.HTTP_401_UNAUTHORIZED)
    expect(data).toEqual({ errors: [{ message: 'Not authorised' }] })
  })
})
