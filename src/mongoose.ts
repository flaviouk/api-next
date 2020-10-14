import * as mongoose from 'mongoose'

import { ServiceMethods } from './types'
import { NotFoundError } from './errors/not-found-error'

export const createMongooseMethods = (
  Model: ReturnType<typeof mongoose.model>,
): ServiceMethods => ({
  find: async (query) => Model.find(query),
  create: async (body) => Model.create(body),
  get: async (pk, query) => Model.findOne({ _id: pk, ...query }),
  update: async (pk, body, query) => {
    const data = await Model.findOne({ _id: pk, ...query })
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
