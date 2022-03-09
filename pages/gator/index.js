import { useForm } from "react-hook-form"
import { useWallet } from "use-wallet"
import { PrimaryButton, SecondaryButton } from "../../components/Button"
import { useConnectWalletModal } from "../../components/ConnectWalletModal"
import PFP from "../../components/PFP"
import PolygonWarning from "../../components/PolygonWarning"
import ShortAddress from "../../components/ShortAddress"
import { ethers, providers } from 'ethers';
import { useState } from "react"
import useInterval from "../../lib/useInterval"
import { collectionAbi, collectionCreatorAbi } from "../../lib/abi"
import useProvider from "../../lib/useProvider"
import toast from "react-hot-toast"
import Link from "next/link"
import axios from "axios"

const COLLECION_CREATOR_CONTRACT = "0x01a2fdf22abdd94c909048a345ee26e5425452ab"

export const Header = ({ children }) => {
  const { openConnectWalletModal } = useConnectWalletModal()
  const { account, reset } = useWallet()

  return (
    <div className="flex items-center justify-between w-full py-4 px-8 bg-daonative-dark-200">
      <div className="md:text-3xl font-space">
        {children}
      </div>
      {!account && (
        <SecondaryButton onClick={openConnectWalletModal} className="h-12">Connect</SecondaryButton>
      )}
      {account && (
        <SecondaryButton onClick={reset} className="h-12 inline-flex gap-4">
          <PFP address={account} />
          <ShortAddress>{account}</ShortAddress>
        </SecondaryButton>
      )}
    </div>
  )
}

const CollectionForm = () => {
  const { account, chainId } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const isPolygon = chainId === 137

  const uploadToIPFS = async (data) => {
    const formData = new FormData()
    formData.append('file', data)
    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    console.log(response)
    return `https://ipfs.infura.io/ipfs/${response.data.Hash}`
  }

  const uploadMetaData = async (name, image) => {
    const imageUri = await uploadToIPFS(image[0])
    const metadata = {
      image: imageUri,
      name
    }
    const metadataUri = await uploadToIPFS(JSON.stringify(metadata))
    return metadataUri
  }

  const createCollection = async (name, symbol, image) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(COLLECION_CREATOR_CONTRACT, collectionCreatorAbi, signer)
    const metadataUri = await uploadMetaData(name, image)
    return await contract.createCollection(name, symbol, metadataUri)
  }

  const handleCreateCollection = async (data) => {
    const toastId = toast.loading("Deploying your NFT collection")
    await createCollection(data.name, data.symbol, data.image)
    toast.success("NFT collection created", { id: toastId })
    reset()
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleCreateCollection)}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium pb-2">
              Collection Name
            </label>
            <input type="text" rows="8" {...register("name", { required: true })} placeholder="School DAO Membership" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
            {errors.name && (
              <span className="text-xs text-red-400">You need to set a name</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium pb-2">
              Symbol
            </label>
            <input type="text" rows="8" {...register("symbol", { required: true })} placeholder="SDM" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
            {errors.symbol && (
              <span className="text-xs text-red-400">You need to set a symbol</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium pb-2">
              Image
            </label>
            <input {...register("image", { required: true })} type="file" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-100 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300 pr-4" />
            {errors.image && (
              <span className="text-xs text-red-400">You need to set an image</span>
            )}
          </div>
          <div>
            {isPolygon && <PrimaryButton type="sumbit">Create collection</PrimaryButton>}
          </div>
        </div>
      </form>
      <PolygonWarning />
    </>
  )
}

const Gator = () => {
  const { account } = useWallet()
  const [collections, setCollections] = useState([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const provider = new providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_POLYGON
  )
  const myCollections = collections.filter(collection => collection.owner === account)

  const getCollectionName = (address) => {
    const contract = new ethers.Contract(address, collectionAbi, provider)
    return contract.name()
  }

  const getOwner = (address) => {
    const contract = new ethers.Contract(address, collectionAbi, provider)
    return contract.owner()
  }

  useInterval(async () => {
    const contract = new ethers.Contract(COLLECION_CREATOR_CONTRACT, collectionCreatorAbi, provider)
    const collectionAddresses = await contract.getCollections()
    const collections = await Promise.all(
      collectionAddresses.map(async address => ({
        address,
        name: await getCollectionName(address),
        owner: await getOwner(address)
      }))
    )
    setCollections(collections)
    setCollectionsLoading(false)
  }, 3000)

  return (
    <div>
      <Header>
        Gator
      </Header>
      <div className="flex flex-col md:flex-row gap-8 p-8">
        <div className="md:w-96">
          <CollectionForm />
        </div>
        <div>
          <ul>
            {collectionsLoading && "loading..."}
            {!collectionsLoading && myCollections.length === 0 && "No NFT collections found"}
            {myCollections.map(collection => (
              <li key={collection.address}>
                <Link href={`/gator/${collection.address}`}>
                  <a>
                    {collection.name} <span className="text-xs">({collection.address})</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div >
  )
}

export default Gator