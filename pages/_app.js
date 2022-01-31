import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head';


function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <UseWalletProvider chainId={137}>
        <Toaster />
        <Component {...pageProps} />
      </UseWalletProvider>
    </>
  )
}

export default MyApp