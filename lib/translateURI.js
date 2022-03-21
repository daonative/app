export const translateURI = (uri) => {
  const IPFS_PROTOCOL = 'ipfs://';

  if (!uri?.startsWith(IPFS_PROTOCOL))
    return uri;

  const ipfsHash = uri.substring(IPFS_PROTOCOL.length);
  return `https://ipfs.infura.io/ipfs/${ipfsHash}`;
};
