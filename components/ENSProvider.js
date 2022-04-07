import { doc, getDoc, getFirestore } from "firebase/firestore";
import { createContext, useContext, useEffect, useReducer, useMemo, useState } from "react";
import { getReadonlyProvider } from "../lib/chainSupport";

const ENSContext = createContext()

export const ENSProvider = ({ children }) => {
  const initialState = {}
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ensNameLoading':
        return {
          ...state,
          [action.account]: {
            ...state?.[action.account],
            ensNameLoading: true
          }
        }
      case 'userProfileLoaded':
        return {
          ...state,
          [action.account]: {
            ...state?.[action.account],
            userName: action.userName
          }
        }
      case 'ensNameLoaded':
        return {
          ...state,
          [action.account]: {
            ...state?.[action.account],
            ensNameLoading: false,
            ensName: action.ensName
          }
        }
      case 'ensAvatarLoaded':
        return {
          ...state,
          [action.account]: {
            ...state?.[action.account],
            ensAvatar: action.ensAvatar
          }
        }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const loadENSProfile = async (account) => {
    dispatch({ type: 'ensNameLoading', account })
    const provider = getReadonlyProvider(1)
    const ensName = await provider.lookupAddress(account)
    dispatch({ type: 'ensNameLoaded', account, ensName })
    if (!ensName) return
    const ensAvatar = await provider.getAvatar(ensName)
    dispatch({ type: 'ensAvatarLoaded', account, ensAvatar })
  }

  const loadUserProfile = async (account) => {
    const db = getFirestore()
    const userRef = doc(db, 'users', account)
    const userSnap = await getDoc(userRef)
    const user = userSnap.data()
    dispatch({ type: 'userNameLoaded', account, userName: user?.name })
  }

  const loadProfile = async (account) => {
    if (state?.[account])
      return
    loadENSProfile(account)
    loadUserProfile(account)
  }

  return (
    <ENSContext.Provider value={{ loadProfile, state }}>
      {children}
    </ENSContext.Provider>
  )
}

export const useProfile = (account) => {
  const { loadProfile, state } = useContext(ENSContext)
  const profile = useMemo(() => state?.[account] || {}, [state, account])
  const { ensNameLoading, ensName, userName } = profile

  useEffect(() => {
    if (!account) return
    loadProfile(account)
  }, [account, loadProfile])


  const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`

  const getDisplayName = () => {
    if (!account) return ""
    if (ensNameLoading) return shortAddress(account)
    if (!ensNameLoading && ensName) return ensName
    if (!ensNameLoading && userName) return userName
    return shortAddress(account)
  }
  return {...profile, displayName: getDisplayName(), displayNameVerified: !!ensName}
}