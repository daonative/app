import { useState } from 'react'
import ConnectWalletButton from '../components/ConnectWalletButton'
import useDarkMode from '../lib/useDarkMode'
import useIsConnected from '../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { doc, getFirestore, updateDoc } from 'firebase/firestore'
import { useWallet } from 'use-wallet'
import { useRouter } from 'next/router'
import { useRequireAuthentication } from '../lib/authenticate'
import { classNames } from '../lib/utils'

const UpdateProfile = () => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const { push } = useRouter()
  const requireAuthentication = useRequireAuthentication()

  useDarkMode()

  const updateProfile = async (name) => {
    const db = getFirestore()
    const userRef = doc(db, 'users', account)
    await updateDoc(userRef, { name })
  }

  const handleUpdateProfile = async (data) => {
    if (!account) return
    setIsLoading(true)
    await requireAuthentication()
    await updateProfile(data.name)
    await push(`/`)
    setIsLoading(false)
  }

  return (
    <div className="overflow-hidden w-full h-screen">
      <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <img src="/DAOnativeLogo.svg" className={classNames("w-32 h-32 m-6", isLoading && "animate-spin-slow")} alt="logo" />
          {isConnected && !isLoading && (
            <>
              <form onSubmit={handleSubmit(handleUpdateProfile)}>
                <div className="flex flex-col md:flex-row w-full">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    className="my-2 md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-component-bg text-daonative-gray-300"
                    placeholder="How should we call you?"
                  />
                  <button
                    type="submit"
                    className="place-self-center my-2 md:mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Set your profile name
                  </button>
                </div>
              </form>
            </>
          )}
          {!isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can change your profile</p>
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

export default UpdateProfile