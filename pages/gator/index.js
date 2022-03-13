import { useForm } from "react-hook-form"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../components/Button"
import PolygonWarning from "../../components/PolygonWarning"
import { ethers, providers } from 'ethers';
import { useEffect, useState } from "react"
import { collectionAbi, collectionCreatorAbi } from "../../lib/abi"
import useProvider from "../../lib/useProvider"
import toast from "react-hot-toast"
import Link from "next/link"
import axios from "axios"
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from "../../components/Modal"
import { LayoutWrapper } from "../../components/LayoutWrapper"
import Spinner from "../../components/Spinner"
import { useRouter } from "next/router"
import { CollectionIcon } from "@heroicons/react/solid";
import ConnectWalletButton from "../../components/ConnectWalletButton";

const COLLECION_CREATOR_CONTRACT = "0xc7c2ed30ba962c0855f41f45ed8212bedd946099"

const CreateCollectionModal = ({ show, onClose }) => {
  const { account, chainId } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const router = useRouter()
  const isPolygon = chainId === 137

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
      const newCollectionTx = await createCollection(data.name, data.symbol, data.image)
      const newCollectionReceipt = await newCollectionTx.wait()
      const newCollectionAddress = getNewCollectionAddressFromTxReceipt(newCollectionReceipt)
      console.log(newCollectionAddress)
      toast.success("NFT collection created", { id: toastId })
      router.push(`${router.asPath}/${newCollectionAddress}`)
      onClose()
      reset()
    } catch (e) {
      toast.error("Failed to create NFT collection", { id: toastId })
      toast.error(e.message)
    }
  }
  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Create your collection</ModalTitle>
      {isPolygon && (
        <form onSubmit={handleSubmit(handleCreateCollection)}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium pb-2">
                  Collection Name
                </label>
                <input type="text" rows="8" {...register("name", { required: true })} placeholder="School DAO Membership" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-white" />
                {errors.name && (
                  <span className="text-xs text-red-400">You need to set a name</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium pb-2">
                  Symbol
                </label>
                <input type="text" rows="8" {...register("symbol", { required: true })} placeholder="SDM" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent " />
                {errors.symbol && (
                  <span className="text-xs text-red-400">You need to set a symbol</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium pb-2">
                  Image
                </label>
                <input {...register("image", { required: true })} type="file" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-100 rounded-md bg-daonative-dark-100 border-transparent " />
                {errors.image && (
                  <span className="text-xs text-red-400">You need to set an image</span>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalActionFooter>
            <PrimaryButton type="sumbit" disabled={isSubmitting}>
              {isSubmitting && (
                <span className="w-4 h-4 mr-2"><Spinner /></span>
              )}
              Create collection
            </PrimaryButton>
          </ModalActionFooter>
        </form>
      )}
      {!isPolygon && (
        <ModalBody>
          <div className="p-12">
            <PolygonWarning />
          </div>
        </ModalBody>
      )}
    </Modal>
  )
}

const EmptyCollectionList = ({ onCreateCollection }) => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <CollectionIcon className="h-12 w-12 " />
    <h3 className="mt-2 text-md font-medium text-daonative-gray-100 pb-6">{"Looks like you don't have any NFT collections"}</h3>
    <PrimaryButton onClick={onCreateCollection}>Create a collection</PrimaryButton>
  </div>
)

const CollectionList = ({ collections }) => {
  const { asPath: path } = useRouter()

  return (
    <ul role="list" className="flex flex-col gap-3">
      {collections?.map(collection => (
        <li key={collection.address}>
          <Link href={`${path}/${collection.address}`}>
            <a>
              <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex gap-4 justify-between">
                <p className="text-sm font-medium text-daonative-gray-100">{collection.name}</p>
                <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                  {collection.symbol}
                </span>
              </div>
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const Gator = ({ roomId }) => {
  const { account } = useWallet()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [collections, setCollections] = useState([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)

  const myCollections = collections.filter(collection => collection.owner === account)

  const handleShowCreateModal = () => setShowCreateModal(true)
  const handleCloseCreateModal = () => setShowCreateModal(false)

  useEffect(() => {
    const readonlyProvider = new providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_POLYGON
    )

    const getCollectionName = (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      return contract.name()
    }

    const getOwner = (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      return contract.owner()
    }

    const getSymbol = (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      return contract.symbol()
    }

    const retrieveCollections = async () => {
      const contract = new ethers.Contract(COLLECION_CREATOR_CONTRACT, collectionCreatorAbi, readonlyProvider)
      const collectionAddresses = await contract.getCollections()
      const collections = await Promise.all(
        collectionAddresses.map(async address => {
          const [name, owner, symbol] = await Promise.all([
            getCollectionName(address),
            getOwner(address),
            getSymbol(address)
          ])
          return {
            address,
            name,
            owner,
            symbol
          }
        })
      )
      setCollections(collections)
      setCollectionsLoading(false)
    }

    retrieveCollections()
  }, [])

  return (
    <div className="text-daonative-white">
      <CreateCollectionModal show={showCreateModal} onClose={handleCloseCreateModal} />
      <div className="flex justify-center px-8 lg:px-0">
        <div className="flex flex-col gap-8 w-full lg:w-3/4">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-2xl">NFT Collection Creator</h2>
              <p className="mt-1 max-w-2xl text-sm text-daonative-subtitle">{"Create your NFT collection that you can easily send privately to your community members. For example, you can use it combination with https://guild.xyz to easily create token-gated chat servers."}</p>
            </div>
            <PrimaryButton onClick={handleShowCreateModal} className={!collectionsLoading && myCollections.length === 0 && "invisible"}>Create Collection</PrimaryButton>
          </div>
          <div className="w-full">

            {collectionsLoading && (
              <div className="flex w-full justify-center p-8">
                <div className="w-8 h-8">
                  <Spinner />
                </div>
              </div>
            )}

            {!account &&
              <ConnectWalletButton >
                <PrimaryButton >
                  Connect your wallet
                </PrimaryButton>
              </ConnectWalletButton>
            }
            {!collectionsLoading && myCollections.length === 0 && account && (
              <EmptyCollectionList onCreateCollection={handleShowCreateModal} />
            )}
            {!collectionsLoading && myCollections.length > 0 && (
              <CollectionList collections={myCollections} />
            )}
          </div>
        </div>
      </div>
    </div >
  )
}


const CollectionListPage = () => {
  return (
    <LayoutWrapper>
      <Gator />
    </LayoutWrapper>
  )
}

export default CollectionListPage