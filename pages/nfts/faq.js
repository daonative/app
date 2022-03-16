import { LayoutWrapper } from "../../components/LayoutWrapper"

const FAQItem = ({ children }) => (
  <li>
    <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex flex-col gap-2">
      {children}
    </div>
  </li>
)

const Question = ({ children }) => (
  <p className="font-bold text-daonative-gray-100">{children}</p>
)

const Answer = ({ children }) => (
  <p className="text-sm text-daonative-gray-100">{children}</p>
)

const NftFaq = () => (
  <div className="flex justify-center px-8 lg:px-0">
    <div className="flex flex-col gap-8 w-full lg:w-3/4">
      <h2 className="text-2xl text-daonative-white">NFTs FAQ</h2>
      <div className="w-full">
        <ul role="list" className="flex flex-col gap-3">
          <FAQItem>
            <Question>Can the token be transfered?</Question>
            <Answer>Yes! As long as the recipient {"doesn't"} own an NFT from the same collection.</Answer>
          </FAQItem>
          <FAQItem>
            <Question>Can it be sold?</Question>
            <Answer>Yes. But the buyer needs to be sure to not own an NFT from the same collection.</Answer>
          </FAQItem>
          <FAQItem>
            <Question>How can my community claim or mint my token?</Question>
            <Answer>The collection creator will have the ability to create a invite link. Everyone with who has this link can mint their token.</Answer>
          </FAQItem>
          <FAQItem>
            <Question>Can I set a max supply?</Question>
            <Answer>No. {"We're"} working this, it will soon be available.</Answer>
          </FAQItem>
          <FAQItem>
            <Question>What is the token type?</Question>
            <Answer>ERC721</Answer>
          </FAQItem>
          <FAQItem>
            <Question>Can I limit the tokens to a maximum per wallet?</Question>
            <Answer>No. By default a wallet can only own one token of the same collection.</Answer>
          </FAQItem>
          <FAQItem>
            <Question>Can I set a price to mint a token?</Question>
            <Answer>No. Let us know if you want this!</Answer>
          </FAQItem>
          <FAQItem>
            <Question>Can I add attributes?</Question>
            <Answer>
              Yes! You can add attributes by setting them in the metadata when you create the collection.
              You can find more info about <a className="underline" href="https://docs.opensea.io/docs/metadata-standards#metadata-structure">metadata</a>{" "}
              and <a className="underline" href="https://docs.opensea.io/docs/metadata-standards#attributes">attributes</a> structure on{" "}
              <a className="underline" href="https://docs.opensea.io/docs/metadata-standards">opensea</a>.{" "}
              Keep in mind that the metadata (and thus the attributes) are the same for every NFT in the whole collection.
            </Answer>
            <Answer>
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
            </Answer>
          </FAQItem>
        </ul>
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