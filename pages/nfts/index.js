import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../components/Button"
import { ethers, providers } from 'ethers';
import { useEffect, useState } from "react"
import { collectionAbi, collectionCreatorAbi } from "../../lib/abi"
import Link from "next/link"
import { LayoutWrapper } from "../../components/LayoutWrapper"
import Spinner from "../../components/Spinner"
import { useRouter } from "next/router"
import { CollectionIcon } from "@heroicons/react/solid";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { Card } from "../../components/Card";

const DEFAULT_CHAIN_ID = 137

export const isSupportedChain = (chainId) => [1, 137].includes(chainId)
export const getCollectionCreatorAddress = (chainId, defaultChainId = DEFAULT_CHAIN_ID) => {
  if (chainId === 137)
    return "0x12CABb27627d5028d213686FF694C57066df56cd"

  if (chainId === 4)
    return "0x2dc5f315decc758d5deacbf303f6ec5897c40976"

  if (chainId === 1)
    return "0x5535ae56A2C005AcE1DB0c9Cd67428b25B03983C"

  if (defaultChainId)
    return getCollectionCreatorAddress(defaultChainId)

  return null
}
export const getReadonlyProvider = (chainId, defaultChainId = DEFAULT_CHAIN_ID) => {
  if (chainId === 137)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON)

  if (chainId === 1)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)

  if (defaultChainId)
    return getReadonlyProvider(defaultChainId)

  return null
}

const EmptyCollectionList = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <CollectionIcon className="h-12 w-12 " />
    <h3 className="mt-2 text-md font-medium text-daonative-gray-100 pb-6">{"Looks like you don't have any NFT collections"}</h3>
  </div>
)

const CollectionList = ({ chainId, collections }) => {
  const { asPath: path } = useRouter()

  return (
    <ul role="list" className="flex flex-col gap-3">
      {collections?.map(collection => (
        <li key={collection.address}>
          <Link href={`${path}/${chainId}/${collection.address}`}>
            <a>
              <Card>

                <div className="flex justify-between">
                  <p className="text-sm font-medium text-daonative-gray-100">{collection.name}</p>
                  <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                    {collection.symbol}
                  </span>
                </div>
              </Card>
            </a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const Gator = () => {
  const { account, chainId } = useWallet()
  const [collections, setCollections] = useState([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)

  const myCollections = collections.filter(collection => collection.owner === account)

  useEffect(() => {
    const readonlyProvider = getReadonlyProvider(chainId)
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
      setCollectionsLoading(true)
      const contractAddress = getCollectionCreatorAddress(chainId)
      const contract = new ethers.Contract(contractAddress, collectionCreatorAbi, readonlyProvider)
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

    if (!chainId) return
    if (!account) return

    retrieveCollections()
  }, [chainId, account])

  return (
    <div className="text-daonative-white">
      <div className="flex justify-center px-8 lg:px-0">
        <div className="flex flex-col gap-8 w-full lg:w-3/4">
          <div className="flex justify-between w-full">
            <div>
              <h2 className="text-2xl">NFT Collection Creator</h2>
              <p className="mt-1 max-w-2xl text-sm text-daonative-subtitle">{"Create your NFT collection that you can easily send privately to your community members. For example, you can use it combination with https://guild.xyz to easily create token-gated chat servers."}</p>
            </div>
            <Link href="/nfts/create">
              <a>
                <PrimaryButton className={(!account || (collectionsLoading)) && "invisible w-max h-max "}>Create Collection</PrimaryButton>
              </a>
            </Link>
          </div>
          <div className="w-full">
            {account && collectionsLoading && (
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
              <EmptyCollectionList />
            )}
            {!collectionsLoading && myCollections.length > 0 && (
              <CollectionList chainId={chainId} collections={myCollections} />
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