import { NextApiRequest, NextApiResponse } from 'next'

export interface DatabaseConnection {
  name: string
  connect: () => Promise<any>
}

export type ApiNextQuery = NextApiRequest['query']
export type ApiNextBody = NextApiRequest['body']

export interface ServiceMethods {
  find?(query: ApiNextQuery): Promise<any>
  create?: (body: ApiNextBody) => Promise<any>
  get?: (pk: string, query: ApiNextQuery) => Promise<any>
  update?: (pk: string, body: ApiNextBody, query: ApiNextQuery) => Promise<any>
  patch?: (pk: string, body: ApiNextBody, query: ApiNextQuery) => Promise<any>
  remove?: (pk: string) => Promise<any>
}

export type Hook = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (error?: any) => void,
) => Promise<void>
