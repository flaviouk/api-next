import { createMocks } from 'node-mocks-http'
import { Status } from 'simple-http-status'

import { createService } from '../src'

describe('[createService/get]', () => {
  test('Should be able to use default id in query', async () => {
    const handler = createService({
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        id: 'cat',
      },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is cat",
      }
    `)
  })
  test('Should be able to use default pk in query', async () => {
    const handler = createService({
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        pk: 'fish',
      },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is fish",
      }
    `)
  })

  test('Should be able to use custom pk in query', async () => {
    const handler = createService({
      pk: {
        name: 'animal',
      },
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        animal: 'dog',
      },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is dog",
      }
    `)
  })

  test('Should be able to use custom pk in query and cast it', async () => {
    const handler = createService({
      pk: {
        name: 'animal',
        cast: (pk) => `__${pk}__`,
      },
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        animal: 'dog',
      },
    })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(Status.HTTP_200_OK)
    expect(JSON.parse(res._getData())).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is __dog__",
      }
    `)
  })
})
