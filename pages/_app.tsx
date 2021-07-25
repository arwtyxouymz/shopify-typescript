import React from 'react'
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloProvider,
} from '@apollo/client'
import App, { AppContext, AppProps } from 'next/app'
import { AppProvider } from '@shopify/polaris'
import { Provider, useAppBridge } from '@shopify/app-bridge-react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'
import { Redirect } from '@shopify/app-bridge/actions'
import type { ClientApplication } from '@shopify/app-bridge'
import '@shopify/polaris/dist/styles.css'
import translations from '@shopify/polaris/locales/en.json'

declare var API_KEY: string

const userLoggedInFetch = (app: ClientApplication<any>) => {
  const fetchFunction = authenticatedFetch(app)

  return async (uri: RequestInfo, options: RequestInit | undefined) => {
    const response = await fetchFunction(uri, options)
    const requireReauthorize = response.headers.get(
      'X-Shopify-API-Request-Failure-Reauthorize'
    )

    if (requireReauthorize === '1') {
      const authUrlHeader = response.headers.get(
        'X-Shopify-API-Request-Failure-Reauthorize-Url'
      )

      const redirect = Redirect.create(app)
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
    }

    return response
  }
}

const MyProvider: React.FC = ({ children }) => {
  const app = useAppBridge()
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      fetch: userLoggedInFetch(app),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/graphql',
      },
    }),
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

type CustomAppProps = AppProps & { host: string }

const MyApp = ({ Component, pageProps, host }: CustomAppProps) => {
  return (
    <AppProvider i18n={translations}>
      <Provider
        config={{
          apiKey: API_KEY,
          host: host,
          forceRedirect: true,
        }}
      >
        <MyProvider>
          <Component {...pageProps} />
        </MyProvider>
      </Provider>
    </AppProvider>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext)
  return { ...appProps, host: appContext.ctx.query.host }
}

export default MyApp
