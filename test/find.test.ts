import { Status } from 'simple-http-status'

import { createService, ApiNextQuery, testService } from '../src'

describe('[createService/find]', () => {
  test('Should be able to return all results', async () => {
    const service = createService({
      find: async () => ['one', 'two'],
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
    })
    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Array [
        "one",
        "two",
      ]
    `)
  })

  test('Should be able to return filtered results based on query params', async () => {
    interface MyQuery extends ApiNextQuery {
      filter: string
    }
    const service = createService({
      find: async (query: MyQuery) =>
        ['one', 'two'].filter((item) => item.includes(query.filter)),
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
      query: {
        filter: 'one',
      },
    })

    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Array [
        "one",
      ]
    `)
  })
})
