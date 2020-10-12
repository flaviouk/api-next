import { Status } from 'simple-http-status'

import { createService, testService } from '../src'

describe('[createService/get]', () => {
  test('Should be able to use default id in query', async () => {
    const service = createService({
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
      query: {
        id: 'cat',
      },
    })

    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is cat",
      }
    `)
  })
  test('Should be able to use default pk in query', async () => {
    const service = createService({
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
      query: {
        pk: 'fish',
      },
    })

    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is fish",
      }
    `)
  })

  test('Should be able to use custom pk in query', async () => {
    const service = createService({
      pk: {
        name: 'animal',
      },
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
      query: {
        animal: 'dog',
      },
    })

    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is dog",
      }
    `)
  })

  test('Should be able to use custom pk in query and cast it', async () => {
    const service = createService({
      pk: {
        name: 'animal',
        cast: (pk) => `__${pk}__`,
      },
      get: async (pk) => ({
        message: `Your favorite animal is ${pk}`,
      }),
    })
    const { statusCode, data } = await testService(service, {
      method: 'GET',
      query: {
        animal: 'dog',
      },
    })

    expect(statusCode).toBe(Status.HTTP_200_OK)
    expect(data).toMatchInlineSnapshot(`
      Object {
        "message": "Your favorite animal is __dog__",
      }
    `)
  })
})
