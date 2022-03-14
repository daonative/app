import { LayoutWrapper } from "../../../../../components/LayoutWrapper";
import { GatorCollection } from "../../../../nfts/[chainId]/[collectionAddress]";

const CollectionPage = () => {
  return (
    <LayoutWrapper>
      <GatorCollection />
    </LayoutWrapper>
  )
}

export default CollectionPage;