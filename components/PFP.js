import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

const PFP = ({address, size}) => (
  <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
)

export default PFP