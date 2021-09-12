import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  concat,
} from '@apollo/client'

export const createClient = (shop: string, accessToken: string) => {
  const httpLink = new HttpLink({
    uri: `https://${shop}/admin/api/2019-10/graphql.json`,
  })

  const authMiddleWare = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'X-Shopify-Access-Token': accessToken,
        'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
      },
    }))
    return forward(operation)
  })

  return new ApolloClient({
    link: concat(authMiddleWare, httpLink),
    cache: new InMemoryCache(),
  })
}
