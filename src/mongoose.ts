import * as mongoose from 'mongoose'

import { ServiceMethods } from './types'
import { NotFoundError } from './errors/not-found-error'

export const createMongooseMethods = (
  Model: ReturnType<typeof mongoose.model>,
): ServiceMethods => ({
  find: async () => Model.find(),
  create: async (body) => Model.create(body),
  get: async (pk) => Model.findById(pk),
  update: async (pk, body) => {
    const data = await Model.findById(pk)
    if (!data) throw new NotFoundError()

    data.set(body)
    await data.save()
    return data
  },
  remove: async (pk) => {
    const data = await Model.findById(pk)
    if (!data) throw new NotFoundError()
    await data.remove()
    return { success: true, data }
  },
})
