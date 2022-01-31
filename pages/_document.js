import Document, { Html, Head, Main, NextScript } from 'next/document'
class MyDocument extends Document {
      /*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */

  render() {
    return (
      <Html lang="en" prefix="og: http://ogp.me/ns#">
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="antialiased h-full bg-gray-100 dark:bg-daonative-dark-300 dark:text-daonative-gray-100">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument