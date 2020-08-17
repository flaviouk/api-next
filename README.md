# api-next

## Usage (example with mongoose)

Reduce boilerplate when creating crud endpoints
Hooks are just middlewares that run before each of the handlers.

`/pages/api/posts/[[...id]].ts`

```ts
import getConfig from 'next/config'
import * as mongoose from 'mongoose'
import { createApi, hook, NotFoundError } from 'api-next'

export interface PostAttrs {
  title: string
}

export interface PostDoc extends mongoose.Document {
  title: string
  likes: number
}

interface PostModel extends mongoose.Model<PostDoc> {
  build(attrs: PostAttrs): PostDoc
}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  likes: {
    type: Number,
    require: false,
    default: 0,
  },
})

const name = 'Post'

const Post = (mongoose.models[name] ||
  mongoose.model<PostDoc, PostModel>(name, postSchema)) as PostModel

// From express-validator
const validateBody = hook.validateRequest(({ body, query, cookies }) => [
  body('title').isString().notEmpty().withMessage('Title is required'),
])

const config = getConfig()

// Concept from Feathersjs: https://feathersjs.com/
const hooks = {
  all: [
    hook.connectToDatabase({
      name: 'posts-db',
      connect: () =>
        mongoose.connect(config.serverRuntimeConfig.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        }),
    }),
  ],
  create: [validateBody],
  update: [validateBody],
}

// All the keys are optional
// Pick what you need
export default createApi({
  hooks,
  find: async () => Post.find(),
  create: async (body: PostAttrs) => Post.build(body),
  get: async (pk) => Post.findById(pk),
  update: async (pk, body: PostAttrs) => {
    const post = await Post.findById(pk)
    if (!post) throw new NotFoundError()

    post.set(body)
    await post.save()
    return post
  },
  remove: async (pk) => {
    const post = await Post.findById(pk)
    if (!post) throw new NotFoundError()
    await post.remove()
    return { success: true, data: post }
  },
})
```

### Alternative

```ts
import { createMongooseApi } from 'api-next'

const { find, create, get, update, remove } = createMongooseApi(Post)

export default createApi({
  hooks,
  find,
  create,
  get,
  update,
  remove,
})
```
