import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../components/Button"
import { ethers } from 'ethers';
import { useEffect, useState } from "react"
import { collectionAbi, collectionCreatorAbi } from "../../lib/abi"
import Link from "next/link"
import { LayoutWrapper } from "../../components/LayoutWrapper"
import Spinner from "../../components/Spinner"
import { useRouter } from "next/router"
import { CollectionIcon } from "@heroicons/react/solid";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { Card } from "../../components/Card";
import { getReadonlyProvider, getCollectionCreatorAddress } from "../../lib/chainSupport";
import NFTSteps from "../../components/NFTSteps";
import { NextSeo } from "next-seo";
import Head from "next/head";



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

  const myCollections = collections.filter(collection => collection.owner === account) || []

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
    <>
      <NextSeo
        title="DAOnative"
        description=""
        canonical="https://app.daonative.xyz/nfts"
        openGraph={{
          images: [{ url: "https://app.daonative.xyz/DAOnativeSEOLogo.png" }],
          url: "https://app.daonative.xyz/nfts",
          title: "NFT Membership Creator",
          description: "Create your NFT collection that you can easily send privately to your community members.",
          site_name: 'DAOnative',
        }}
        twitter={{
          handle: '@daonative',
          cardType: 'summary_large_image',
        }}
      />
      <div className="text-daonative-white">
        <div className="flex justify-center px-8 lg:px-0">
          <div className="flex flex-col gap-8 w-full lg:w-3/4">
            <div className="flex flex-wrap sm:flex-nowrap justify-between w-full">
              <div>
                <h2 className="text-2xl">NFT Collection Creator</h2>
                <p className="mt-1 text-xs md:text-sm text-daonative-text">
                  {"Create your NFT collection that you can easily send privately to your community members. For example, you can use it combination with https://guild.xyz to easily create token-gated chat servers. "}
                  <Link href="/nfts/faq"><a className="underline hover:text-daonative-white">How does it work?</a></Link>
                </p>
              </div>
              <div className="mt-7 mb-2 sm:mt-0 flex justify-center w-full sm:w-fit sm:ml-4">
                {!account &&
                  <ConnectWalletButton >
                    <PrimaryButton >
                      Connect your wallet
                    </PrimaryButton>
                  </ConnectWalletButton>
                }
                {account &&
                  <Link href="/nfts/create">
                    <a className="flex items-end ">
                      <PrimaryButton  >Create Collection</PrimaryButton>
                    </a>
                  </Link>
                }
              </div>
            </div>
            <div className="w-full">
              <div className="">
                {myCollections.length === 0 && (
                  <>
                    <div className="py-8">
                      <NFTSteps />
                    </div>
                    {account && collectionsLoading && (
                      <div className="flex w-full justify-center p-8">
                        <div>
                          Loading...
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {!collectionsLoading && myCollections.length > 0 && (
                <CollectionList chainId={chainId} collections={myCollections} />
              )}
            </div>
          </div>
        </div>
      </div >
    </>
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