import { Disclosure } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/solid"
import { Card } from "../../components/Card"
import { LayoutWrapper } from "../../components/LayoutWrapper"
import { classNames } from "../../lib/utils"

/*}
  <li>
    <div className="px-4 py-4 sm:px-6 bg-daonative-component-bg rounded flex flex-col gap-2">
      {children}
    </div>
  </li>
*/

const FAQItem = ({ children, question }) => (
  <Disclosure as="div" className="pt-6">
    {({ open }) => (
      <Card>
        <dt className="text-lg">
          <Disclosure.Button className="text-left w-full flex justify-between items-start text-daonative-white">
            <span className="font-medium">{question}</span>
            <span className="ml-6 h-7 flex items-center">
              <ChevronDownIcon
                className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-6 w-6 transform')}
                aria-hidden="true"
              />
            </span>
          </Disclosure.Button>
        </dt>
        <Disclosure.Panel as="dd" className="mt-2 pr-12">
          <div className="text-base">{children}</div>
        </Disclosure.Panel>
      </Card>
    )}
  </Disclosure>
)

const NftFaq = () => (
  <div className="flex justify-center px-8 lg:px-0">
    <div className="flex flex-col gap-8 w-full lg:w-3/4">
      <h2 className="text-2xl text-daonative-white">NFTs FAQ</h2>
      <div className="w-full">
        <dl className="">
          <FAQItem question="How can I reach out to you?">
            <a className="underline hover:text-daonative-primary-purple" href="https://discord.gg/m3mC5f4jBU" target="_blank" rel="noreferrer">Join our Discord</a>!
          </FAQItem>
          <FAQItem question="Which network is it available on?">
            {"We're currently available on Ethereum mainnet, rinkeby & Polygon mainnet"}
          </FAQItem>
          <FAQItem question="Do I need to pay for minting?">
            No, your community members will pay for minting
          </FAQItem>
          <FAQItem question="Who is the collection owner?">
            Contrary to OpenSea, you own the contract.
          </FAQItem>
          <FAQItem question="Can the token be transfered?">
            Yes!
          </FAQItem>
          <FAQItem question="Can it be sold?">
            Yes.
          </FAQItem>
          <FAQItem question="How can my community claim or mint my token?">
            The collection creator will have the ability to create a invite link. Everyone with who has this link can mint their token.
          </FAQItem>
          <FAQItem question="Can I set a max supply?">
            No. {"We're"} working this, it will soon be available.
          </FAQItem>
          <FAQItem question="What is the token type?">
            ERC721
          </FAQItem>
          <FAQItem question="Can I limit the tokens to a maximum per wallet?">
            No. By default a wallet can only own one token of the same collection.
          </FAQItem>
          <FAQItem question="Can I set a price to mint a token?">
            No. Let us know if you want this!
          </FAQItem>
          <FAQItem question="Why doesn't my token artwork show up on OpenSea?">
            It takes OpenSea some time to fetch and cache the artwork. Use the refresh metadata button, in the top right corner of your token in OpenSea, to make sure OpenSea has a cached version of your artwork.
          </FAQItem>
          <FAQItem question="Can I add attributes?">
            <p>
              Yes! You can add attributes by setting them in the metadata when you create the collection.
              You can find more info about <a className="underline" href="https://docs.opensea.io/docs/metadata-standards#metadata-structure">metadata</a>{" "}
              and <a className="underline" href="https://docs.opensea.io/docs/metadata-standards#attributes">attributes</a> structure on{" "}
              <a className="underline" href="https://docs.opensea.io/docs/metadata-standards">opensea</a>.{" "}
              Keep in mind that the metadata (and thus the attributes) are the same for every NFT in the whole collection.
            </p>
            <p>
              Example metadata with attributes:
              <pre>
                {`{
  "description": "A DAOnative core member",
  "name": "DAOnative core",
  "image": "https://ipfs.infura.io/ipfs/QmcnySmHZNj9r5gwS86oKsQ8Gu7qPxdiGzvu6KfE1YKCSu",
  "attributes": [
    {
      "trait_type": "Batch #",
      "value": "1"
    },
    {
      "trait_type": "Contributor Level",
      "value": "Rock Star"
    }
  ]
}`}
              </pre>
            </p>
          </FAQItem>
          <FAQItem question="My question is not answered">
            <a className="underline hover:text-daonative-primary-purple" href="https://discord.gg/m3mC5f4jBU" target="_blank" rel="noreferrer">Join our Discord</a>. {"We're more than happy to answer your questions!"}
          </FAQItem>
        </dl>
      </div>
    </div>
  </div>
)


const NftFaqPage = () => {
  return (
    <LayoutWrapper>
      <NftFaq />
    </LayoutWrapper>
  )
}

export default NftFaqPage