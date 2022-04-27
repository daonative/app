import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import Head from 'next/head';
import { ConnectWalletModalProvider } from '../components/ConnectWalletModal';
import { useEffect } from 'react'
import ProfileModal, { ProfileModalProvider } from '../components/ProfileModal'
import { Provider, createClient } from 'wagmi'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

initializeApp(firebaseConfig)

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === "undefined")
      return

    getAnalytics()
  }, [])

  const client = createClient()

  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <Provider client={client}>
        <UseWalletProvider
          autoConnect={true}
          chainId={137}
          connectors={{
            walletconnect: {
              bridge: 'https://bridge.walletconnect.org',
              rpc: {
                1: process.env.NEXT_PUBLIC_RPC_MAINNET,
                4: process.env.NEXT_PUBLIC_RPC_RINKEBY,
                137: process.env.NEXT_PUBLIC_RPC_POLYGON
              }
            }
          }}
        >
          <ConnectWalletModalProvider>
            <ProfileModalProvider>
              <Toaster position="bottom-center" />
              <Component {...pageProps} />
            </ProfileModalProvider>
          </ConnectWalletModalProvider>
        </UseWalletProvider>
      </Provider>
    </>
  )
}

export default MyApp