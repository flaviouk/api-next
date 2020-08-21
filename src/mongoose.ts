import * as mongoose from 'mongoose'

import { Services } from 'types'
import { NotFoundError } from 'errors/not-found-error'

export const createMongooseApi = (
  Model: ReturnType<typeof mongoose.model>,
): Services => ({
  find: async () => Model.find(),
  create: async (body) => Model.create(body),
  get: async (pk) => Model.findById(pk),
  update: async (pk, body) => {
    const post = await Model.findById(pk)
    if (!post) throw new NotFoundError()

    post.set(body)
    await post.save()
    return post
  },
  remove: async (pk) => {
    const post = await Model.findById(pk)
    if (!post) throw new NotFoundError()
    await post.remove()
    return { success: true }
  },
})
