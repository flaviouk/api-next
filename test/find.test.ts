import { createMocks } from 'node-mocks-http'
import { Status } from 'simple-http-status'

import { createService, ApiNextQuery } from '../src'

describe('[createService/find]', () => {
  test('Should be able to return all results', async () => {
    const handler = createService({
      find: async () => ['one', 'two'],
    })
    const { req, res } = createMocks({
      method: 'GET',
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
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
    const handler = createService({
      find: async (query: MyQuery) =>
        ['one', 'two'].filter((item) => item.includes(query.filter)),
    })
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        filter: 'one',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
      Array [
        "one",
      ]
    `)
  })
})
