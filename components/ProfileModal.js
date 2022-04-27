import React, { createContext, useContext } from 'react'
import { CheckIcon } from "@heroicons/react/solid"
import { collectionGroup, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useWallet } from "@/lib/useWallet"
import { PrimaryButton, SecondaryButton } from "../components/Button"
import { UserName } from "../components/PFP"
import { Modal, ModalBody, ModalTitle } from "./Modal"

import { classNames } from "../lib/utils"
import { useForm } from "react-hook-form"
import { useRequireAuthentication } from "../lib/authenticate"
import Spinner from "./Spinner"
import { Tab } from '@headlessui/react'
import { loadUserProfile } from '../lib/useUserProfile'

import axios from 'axios'
import { useDocumentData } from 'react-firebase-hooks/firestore'

const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)

const DiscordConnectButton = () => {
  const [status, setStatus] = useState("connectable")
  const [discordToken, setDiscordToken] = useState()
  const [discordError, setDiscordError] = useState()
  const requireAuthentication = useRequireAuthentication()
  const { account } = useWallet()

  useEffect(() => {
    const getDiscordUser = async (accessToken, tokenType) => {
      const discordAuthorization = `${tokenType} ${accessToken}`
      try {
        const { data } = await axios.get(`https://discord.com/api/users/@me`, {
          headers: { authorization: `${discordAuthorization}` },
        })
        return data
      } catch (error) {
        return null
      }
    }

    const updateProfile = async (discordUserId, discordHandle) => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      await updateDoc(userRef, { discordUserId, discordHandle })
    }

    const linkDiscordAccount = async () => {
      const user = await getDiscordUser(discordToken.accessToken, discordToken.tokenType)
      const discordHandle = `${user.username}#${user.discriminator}`
      setStatus("signing")
      await requireAuthentication()
      setStatus("saving")
      await updateProfile(user.id, discordHandle)
      setStatus("success")
    }

    if (!discordToken?.accessToken || !discordToken?.tokenType)
      return

    linkDiscordAccount()

  }, [discordToken])

  useEffect(() => {
    if (!discordError)
      return

    setStatus("error")
  }, [discordError])

  const handleDiscordConnect = () => {
    const discordClientId = "966363225576845352"
    const discordRedirectUrl = encodeURIComponent(`${window.location.origin}/discord`)
    const discordConnectURL = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${discordRedirectUrl}&response_type=token&scope=identify`
    setStatus("connecting")
    window.open(discordConnectURL, 'popup', 'width=500,height=800')
    window.setDiscordToken = setDiscordToken
    window.setDiscordError = setDiscordError
  }

  if (status === "connectable")
    return (
      <SecondaryButton
        onClick={handleDiscordConnect}
      >
        Connect with Discord
      </SecondaryButton>
    )

  return (
    <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-daonative-white h-max bg-daonative-component-bg">
      {status === "connecting" && (
        <>
          <span className="w-4 h-4 mr-4"><Spinner /></span>
          Connecting with Discord
        </>
      )}
      {status === "signing" && (
        <>
          <span className="w-4 h-4 mr-4"><Spinner /></span>
          Sign to verify your account
        </>
      )}
      {status === "saving" && (
        <>
          <span className="w-4 h-4 mr-4"><Spinner /></span>
          Connecting with Discord
        </>
      )}
      {status === "success" && (
        <>
          Connected with Discord!
        </>
      )}
      {status === "error" && (
        <>
          Oops, something went wrong.
        </>
      )}
    </div>
  )
}

const ProfileModal = ({ show, onClose, selectedIndex, onChange }) => {
  const db = getFirestore()
  const { account } = useWallet()
  const [submissionCount, setSubmissionCount] = useState(0)
  const [verifiedXps, setVerifiedXps] = useState(0)
  const { register, handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const [user, userLoading] = useDocumentData(
    doc(db, 'users', account || 'null')
  )

  const updateProfile = async (name) => {
    const db = getFirestore()
    const userRef = doc(db, 'users', account)
    await updateDoc(userRef, { name })
  }

  const handleUpdateProfile = async (data) => {
    await requireAuthentication()
    await updateProfile(data.name)
    await loadUserProfile(account)
  }

  useEffect(() => {
    const retrieveUserProfile = async () => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) return

      const { name } = userDoc.data()
      reset({ name })

    }

    if (!account) return
    retrieveUserProfile()
  }, [account, reset])

  useEffect(() => {
    const retrieveLeaderboardPositions = async () => {
      const db = getFirestore()
      const leaderboardPositionsQuery = query(collectionGroup(db, 'leaderboard'), where('userAccount', '==', account || 'x'))
      const leaderboardPositionsSnapshot = await getDocs(leaderboardPositionsQuery)
      const leaderboardPositions = leaderboardPositionsSnapshot.docs.map(doc => doc.data())

      const submissionCount = leaderboardPositions
        .map(leaderboardPosition => leaderboardPosition.submissionCount)
        .reduce((total, currentValue) => total + currentValue, 0)

      const verifiedXps = leaderboardPositions
        .map(leaderboardPosition => leaderboardPosition.verifiedExperience)
        .reduce((total, currentValue) => total + currentValue, 0)

      setSubmissionCount(submissionCount)
      setVerifiedXps(verifiedXps)
    }

    retrieveLeaderboardPositions()
  }, [account])

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>
        <div className="4 mx-auto  flex flex-col ">
          <div className='flex justify-between'>
            <div className='flex flex-col gap-3'>
              <h1 className="text-xl">
                <UserName account={account} />
              </h1>
              <div className="relative flex flex-col">
                <div className="flex flex-col justify-between w-full ">
                  <span className="text-xs text-daonative-subtitle">Role</span>
                  <h2 className="text-m">
                    Guild Hero
                  </h2>

                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div>
                <span className="py-0.5 px-4 text-sm rounded-md font-medium bg-blue-100 text-blue-800 font-weight-600 font-space text-center inline">
                  {kFormatter(verifiedXps)} XPs
                </span>
              </div>

              <div className="text-daonative-subtitle text-sm flex">
                <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                {submissionCount} Challenges Completed
              </div>
            </div>
          </div>

        </div>

      </ModalTitle>
      <ModalBody>
        <Tab.Group selectedIndex={selectedIndex} onChange={onChange}>
          <Tab.List className={'flex gap-3'}>
            <Tab className={({ selected }) => (classNames(
              selected
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ))}
            >
              Rewards
            </Tab>

            <Tab className={({ selected }) => (classNames(
              selected
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ))}
            >
              Settings
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <>
                <div className="flex justify-between w-full items-end pt-8 ">
                  <div>
                    <h2 className="text-xl">Latest Rewards</h2>
                  </div>
                </div>
                <div className="flex gap-6 relative justify-between">
                  <div className="flex gap-6 ">
                    <div className="absolute top-0 left-0 w-full h-full bg-daonative-dark-300 bg-opacity-80">
                      <div className="flex items-center justify-center text-3xl pt-20">
                        Coming soon
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-daonative-subtitle">Undefined contract #5</span>
                      <img src="https://arweave.net/Jf6CQMTDHpNu2jpGrwTSr6V9hdsp7geyqQM0xypenTE" className="w-32 rounded-md" />
                    </div>
                    <div>
                      <span className="text-xs text-daonative-subtitle">Early Adopters Gen 1</span>
                      <img src="https://ipfs.infura.io/ipfs/QmcebJ4PbN3yXKSZoKdf7y7vBo5T4X98VKGULnkdFnAK2m" className="w-32 rounded-md" />
                    </div>

                  </div>
                  <div className='flex flex-col gap-3'>
                    <div className="flex gap-1">
                      <span className="">{Math.floor(verifiedXps / 10)}</span>
                      <span className="text-daonative-subtitle ">$GREEN</span>
                    </div>
                    <PrimaryButton disabled={true}>Claim</PrimaryButton>
                  </div>
                </div>
              </>
            </Tab.Panel>
            <Tab.Panel>
              <>
                <form onSubmit={handleSubmit(handleUpdateProfile)}>
                  <div className="mx-auto   flex flex-col gap-4 pt-8">
                    <div>
                      <label className="block text-sm font-medium pb-2">
                        Nickname
                      </label>
                      <input type="text" {...register("name", { required: false })} placeholder="Han Solo" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium pb-2">
                        Discord handle
                      </label>
                      {(!user?.discordHandle || !user?.discordUserId) ? (
                        <DiscordConnectButton />
                      ) : (
                        <>
                          <span className="font-mono">@{user.discordHandle}</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-4 items-center">
                      {isSubmitSuccessful && <CheckIcon className="h-6 w-6 text-green" />}
                      <PrimaryButton type="submit">
                        {isSubmitting ? (
                          <span className="w-4 h-4 mx-auto"><Spinner /></span>
                        ) : (
                          <>Save</>
                        )}
                      </PrimaryButton>
                    </div>
                  </div>
                </form>
              </>
            </Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </ModalBody>
    </Modal >

  )
}

const ProfileModalContext = createContext()
export const ProfileModalProvider = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false);

  const openProfileModal = (tab) => {
    if (tab === "settings") setSelectedIndex(1)
    setIsOpen(true)
  }
  const closeProfileModal = () => setIsOpen(false)

  return (
    <ProfileModalContext.Provider value={{ openProfileModal, closeProfileModal }}>
      <ProfileModal show={isOpen} onClose={closeProfileModal} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
      {children}
    </ProfileModalContext.Provider>
  )
}

export const useProfileModal = () => {
  return useContext(ProfileModalContext);
}

export default ProfileModal