import { Status, Method } from 'simple-http-status'

import { createService, testService } from '../src'

const tests = [
  {},
  {
    find: async () => ['one', 'two'],
  },
  {
    create: async () => 'one',
  },
  {
    get: async () => 'one',
  },
  {
    update: async () => 'one',
  },
  {
    patch: async () => 'one',
  },
  {
    remove: async () => 'one',
  },
  {
    find: async () => ['one', 'two'],
    create: async () => 'one',
    get: async () => 'one',
    update: async () => 'one',
    patch: async () => 'one',
    remove: async () => 'one',
  },
]

tests.map((services) => {
  const handler = createService(services)
  const allServices = [
    { name: 'find', reqOptions: { method: Method.GET } },
    { name: 'create', reqOptions: { method: Method.POST } },
    {
      name: 'get',
      reqOptions: { method: Method.GET, query: { id: 'asiudhdsaiu' } },
    },
    {
      name: 'update',
      reqOptions: { method: Method.PUT, query: { id: 'asiudhdsaiu' } },
    },
    {
      name: 'patch',
      reqOptions: { method: Method.PATCH, query: { id: 'asiudhdsaiu' } },
    },
    {
      name: 'remove',
      reqOptions: { method: Method.DELETE, query: { id: 'asiudhdsaiu' } },
    },
  ]
  const availableServices = Object.keys(services)

  return describe(`[createApi] (${availableServices.join(
    ', ',
  )}) Should return not found for other services`, () => {
    allServices.map((service) => {
      const isAvailable = availableServices.includes(service.name)

      return test(`is "${service.name}" available? ${isAvailable}`, async () => {
        const { statusCode, data } = await testService(
          handler,
          service.reqOptions,
        )

        if (isAvailable) {
          expect(statusCode).not.toBe(Status.HTTP_404_NOT_FOUND)
          expect(data).toEqual(
            // @ts-ignore
            await services[service.name](),
          )
        } else {
          expect(statusCode).toBe(Status.HTTP_404_NOT_FOUND)
          expect(data).toEqual({
            errors: [{ message: 'Not Found' }],
          })
        }
      })
    })
  })
})
