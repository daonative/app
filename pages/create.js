import ConnectWalletButton from '../components/ConnectWalletButton'
import useDarkMode from '../lib/useDarkMode'
import useIsConnected from '../lib/useIsConnected'

const Join = () => {
  const isConnected = useIsConnected()

  useDarkMode()

  return (
    <div className="overflow-hidden w-full h-screen">
      <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center ">
          <img src="./DAOnativeLogo.svg" className="w-32 h-32 m-6" />
          {isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold">What's the name of your DAO?</p>
              <div className="flex flex-col md:flex-row w-full">
                <input
                  type="text"
                  name="work"
                  className="my-2 md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
                  placeholder="School DAO"
                />
                <button
                  type="button"
                  className="place-self-center my-2 md:mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create your DAO
                </button>
              </div>
            </>
          )}
          {!isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can create your DAO</p>
              <div className="w-36 h-16">
                <ConnectWalletButton />
              </div>
            </>
          )}
        </div>
      </main>
    </div >
  )
}

export default Join