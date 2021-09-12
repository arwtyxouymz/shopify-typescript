import Koa from 'koa'
import { ApolloClient, InMemoryCache } from '@apollo/client'

export interface ExtendedKoaContext extends Koa.Context {
  client: ApolloClient<InMemoryCache>
}
