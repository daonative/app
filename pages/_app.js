import '../styles/globals.css'

import { ChainId, DAppProvider } from '@usedapp/core'
import { Toaster } from 'react-hot-toast'



const config = {
  readOnlyChainId: ChainId.Polygon,
  readOnlyUrls: {
    [ChainId.Polygon]: process.env.NEXT_PUBLIC_POLYGON_RPC,
  },
}

function MyApp({ Component, pageProps }) {
  return (
    <DAppProvider config={config}>
      <Toaster />
      <Component {...pageProps} />
    </DAppProvider>
  )
}

export default MyApp
