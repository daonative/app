import { useForm } from "react-hook-form"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../components/Button"
import PolygonWarning from "../../components/ChainWarning"
import { ethers, providers } from 'ethers';
import { useEffect, useState } from "react"
import { collectionCreatorAbi } from "../../lib/abi"
import useProvider from "../../lib/useProvider"
import toast from "react-hot-toast"
import Link from "next/link"
import axios from "axios"
import { LayoutWrapper } from "../../components/LayoutWrapper"
import Spinner from "../../components/Spinner"
import { useRouter } from "next/router"
import { HeartIcon } from "@heroicons/react/outline";
import ConnectWalletButton from "../../components/ConnectWalletButton";

import { Disclosure, Transition } from '@headlessui/react'
import { ChevronRightIcon, PhotographIcon } from '@heroicons/react/solid'

import { classNames } from '../../lib/utils'


import PolygonLogo from '../../public/PolygonLogo.svg'
import EthereumLogo from '../../public/EthereumLogo.svg'
import { useProfile } from "../../components/ProfileProvider";

const isSupportedChain = (chainId) => [1, 137].includes(chainId)
const getCollectionCreatorAddress = (chainId, defaultChainId = 1) => {
  if (chainId === 137)
    return "0xc7c2ed30ba962c0855f41f45ed8212bedd946099"

  if (chainId === 1)
    return "0x03a73053d2c34c4629d821c6f3369f58a05dfef7"

  if (defaultChainId)
    return getCollectionCreatorAddress(defaultChainId)

  return null
}

const CollectionForm = ({ onImage, onMetadata, onName }) => {
  const { account, chainId } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit, watch, reset, getValues, formState: { errors, isSubmitting } } = useForm()
  const router = useRouter()

  const [watchMetadata, watchImage, watchName] = watch(["metadata", "image", "name"])

  useEffect(() => {
    onMetadata(watchMetadata)
  }, [onMetadata, watchMetadata])

  useEffect(() => {
    onImage(watchImage)
  }, [onImage, watchImage])

  useEffect(() => {
    onName(watchName)
  }, [onName, watchName])

  const uploadToIPFS = async (data) => {
    const formData = new FormData()
    formData.append('file', data)
    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return `https://ipfs.infura.io/ipfs/${response.data.Hash}`
  }

  const uploadImageAndMetadata = async (name, image) => {
    const imageUri = await uploadToIPFS(image[0])
    const metadata = {
      image: imageUri,
      name
    }
    const metadataUri = await uploadToIPFS(JSON.stringify(metadata))
    return metadataUri
  }

  const uploadOnlyMetadata = async (metadata) => {
    const metadataUri = await uploadToIPFS(metadata)
    return metadataUri
  }

  const createCollection = async (name, symbol, image, metadata) => {
    if (image?.length > 0 && metadata) {
      throw Error("Cannot create a collection when both an image is uploaded and metadata is provided.")
    }

    if (!isSupportedChain(chainId)) {
      throw Error("Unsupported chain")
    }

    const signer = provider.getSigner(account)
    const contractAddress = getCollectionCreatorAddress(chainId)
    const contract = new ethers.Contract(contractAddress, collectionCreatorAbi, signer)
    const metadataUri = metadata ? (
      await uploadOnlyMetadata(metadata)
    ) : (
      await uploadImageAndMetadata(name, image)
    )
    return await contract.createCollection(name, symbol, metadataUri, 0, 0)
  }


  const getNewCollectionAddressFromTxReceipt = (txReceipt) => {
    const collectionCreatorInterface = new ethers.utils.Interface(collectionCreatorAbi)
    return txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          const event = collectionCreatorInterface.parseLog(log)
          return event
        } catch (e) {
          return undefined
        }
      })
      // Get rid of the unknown events
      .filter((event) => event !== undefined)
      // Keep only Transfer events
      .filter((event) => event.name === "CollectionCreated")
      // Take the third argument which is the token id
      .map((event) => event.args[0].toString())
      // Take the first token id (there is only one)
      .shift()
  }

  const handleCreateCollection = async (data) => {
    const toastId = toast.loading("Deploying your NFT collection")
    try {
      const newCollectionTx = await createCollection(data.name, data.symbol, data.image, data.metadata)
      const newCollectionReceipt = await newCollectionTx.wait()
      const newCollectionAddress = getNewCollectionAddressFromTxReceipt(newCollectionReceipt)
      toast.success("NFT collection created", { id: toastId })
      router.push(`${router.asPath.replace('/create', '')}/${chainId}/${newCollectionAddress}`)
      reset()
    } catch (e) {
      toast.error("Failed to create NFT collection", { id: toastId })
      toast.error(e.message)
    }
  }

  const checkMetaDataOrImage = (image, metadata) => {
    if (image.length > 0 && !metadata) return true
    if (image.length === 0 && metadata) return true
    return false
  }

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  return (
    <form onSubmit={handleSubmit(handleCreateCollection)}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium pb-2">
            Collection Name
          </label>
          <input type="text" rows="8" {...register("name", { required: true })} placeholder="DAOnative Core" className="shadow-sm focus:ring-indigo-500 focus:border-daonative-border block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-white" />
          {errors.name && (
            <span className="text-xs text-red-400">You need to set a name</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium pb-2">
            Symbol
          </label>
          <input type="text" rows="8" {...register("symbol", { required: true })} placeholder="NATIV" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent " />
          {errors.symbol && (
            <span className="text-xs text-red-400">You need to set a symbol</span>
          )}
        </div>
        <Disclosure>
          {({ open }) => (
            <>
              <div>
                <label className="block text-sm font-medium pb-2">
                  Image
                </label>
                <input {...register("image", { required: false, validate: { metaOrImage: value => checkMetaDataOrImage(value, getValues('metadata')) } })} type="file" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-100 rounded-md bg-daonative-component-bg border-transparent" />
                {!open && (errors?.image?.type === "metaOrImage" || errors?.metadata?.type === "metaOrImage") && (
                  <span className="block text-xs text-red-400 pt-2">You need to set an image</span>
                )}
              </div>
              <Disclosure.Button className="flex w-full justify-end text-sm text-daonative-subtitle">
                <div className="flex items-center">
                  <ChevronRightIcon className={classNames('w-5 h-5', open && 'transform rotate-90')} />

                  <span>Show advanced settings</span>
                </div>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel>
                  <div>
                    <span className="text-xs text-daonative-subtitle py-4 ">
                      💡 When setting metadata the image field will be ignored.
                    </span>
                    <label className="block text-sm font-medium py-2">
                      Metadata
                    </label>
                    <textarea
                      {...register("metadata", {
                        required: false,
                        validate: {
                          metaOrImage: value => checkMetaDataOrImage(getValues('image'), value),
                          json: value => !value || isValidJSON(value)
                        }
                      })
                      }
                      rows={8}
                      placeholder={'{\n"image":"https://ipfs.infura.io/ipfs/QmcnySmHZNj9r5gwS86oKsQ8Gu7qPxdiGzvu6KfE1YKCSu",\n"name":"DAOnative Membership",\n"description":""\n}'}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent"
                    />
                    {open && (errors?.image?.type === "metaOrImage" || errors?.metadata?.type === "metaOrImage") && (
                      <span className="block text-xs text-red-400 pt-2">You need to set either an image or metadata</span>
                    )}
                    {errors?.metadata?.type === "json" && (
                      <span className="block text-xs text-red-400">Metadata should be a valid JSON format</span>
                    )}
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
      <div className="flex justify-between items-center w-full pt-8">
        <Link href="/nfts/faq"><a className="underline text-sm">How does this work?</a></Link>
        <PrimaryButton type="sumbit" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="w-4 h-4 mr-2"><Spinner /></span>
          )}
          Create collection
        </PrimaryButton>
      </div>
    </form>
  )
}
export const ImagePreview = ({ uri }) => {

  return (
    <div className="flex items-center justify-center h-full p-2" style={{ maxWidth: 350, }}>
      {uri ? <img src={uri} className="h-auto w-full" /> : <PhotographIcon className="text-daonative-dark-100 w-32" />}
    </div>

  )
}


export const OpenSeaPreview = ({ collectionName, metadata, chainId }) => {
  const imageUri = metadata.image
  const tokenName = metadata.name
  const { displayName } = useProfile()

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex flex-col border border-daonative-border  rounded w-96 min-h-[18em] overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div>
            {chainId === 1 && <EthereumLogo className="w-4 h-4" />}
            {chainId === 137 && <PolygonLogo className="w-4 h-4" />}
          </div>
          <div className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            <span className="text-xs">0</span>
          </div>
        </div>
        <ImagePreview uri={imageUri} />
      </div>
      <div>
        <div className="text-xs text-daonative-primary-purple h-12 inline-flex items-center font-bold">{collectionName || "DAOnative Core"}</div>
        <div className="text-lg text-daonative-white">{tokenName || "DAOnative Core"} #1</div>
        <div className="text-xs text-daonative-subtitle">
          owned by{" "}
          <span className="text-daonative-primary-purple">{displayName}</span>
        </div>
      </div>
    </div>
  )
}

export const CreateNFT = () => {
  const { account, chainId } = useWallet()
  const [formImage, setFormImage] = useState(null)
  const [formName, setFormName] = useState("")
  const [formMetadata, setFormMetadata] = useState({})
  const [previewMetadata, setPreviewMetadata] = useState({})

  useEffect(() => {
    setPreviewMetadata({})

    if ((formImage?.length > 0 || formName) && formMetadata) return

    if (formImage?.length > 0 || formName) {
      const imageURI = formImage.length > 0 ? URL.createObjectURL(formImage[0]) : ""
      setPreviewMetadata({
        image: imageURI,
        name: formName
      })
      return
    }

    if (formMetadata) {
      try {
        setPreviewMetadata(JSON.parse(formMetadata))
      } catch (e) {
        setPreviewMetadata({})
      }
    }
  }, [formImage, formName, formMetadata])

  return (
    <div className="text-daonative-white">
      <div className="flex justify-center px-8">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-space">NFT Collection Creator</h2>
            <p className="mt-1 max-w-2xl text-sm text-daonative-subtitle">{"Create an NFT collection and share a minting link to your community. For example, you can use it combination with https://guild.xyz to easily create token-gated chat servers."}</p>
          </div>
          <div className="w-full">
            {!account &&
              <ConnectWalletButton >
                <PrimaryButton >
                  Connect your wallet
                </PrimaryButton>
              </ConnectWalletButton>
            }
            {account && (
              <div className="flex gap-8 flex-col lg:flex-row">
                <div className="grow max-w-md">
                  <CollectionForm onImage={setFormImage} onMetadata={setFormMetadata} onName={setFormName} />
                </div>
                <div className="flex-none">
                  <OpenSeaPreview metadata={previewMetadata} collectionName={formName} chainId={chainId} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}


const CreateNFTPage = () => {
  return (
    <LayoutWrapper>
      <CreateNFT />
    </LayoutWrapper>
  )
}

export default CreateNFTPage