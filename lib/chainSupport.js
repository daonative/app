import { providers } from 'ethers';

export const DEFAULT_CHAIN_ID = 1
export const isSupportedChain = (chainId) => [1, 4, 137].includes(chainId);
export const getCollectionCreatorAddress = (chainId, defaultChainId = DEFAULT_CHAIN_ID) => {
  if (chainId === 137)
    return "0x12CABb27627d5028d213686FF694C57066df56cd";

  if (chainId === 4)
    return "0x2dc5f315decc758d5deacbf303f6ec5897c40976";

  if (chainId === 1)
    return "0x5535ae56A2C005AcE1DB0c9Cd67428b25B03983C";

  if (defaultChainId)
    return getCollectionCreatorAddress(defaultChainId);

  return null;
};
export const getReadonlyProvider = (chainId, defaultChainId = DEFAULT_CHAIN_ID) => {
  if (chainId === 137)
    return new providers.InfuraWebSocketProvider(137, process.env.NEXT_PUBLIC_INFURA_API_KEY);

  if (chainId === 4)
    return new providers.InfuraWebSocketProvider(4, process.env.NEXT_PUBLIC_INFURA_API_KEY);

  if (chainId === 1)
    return new providers.InfuraWebSocketProvider(1, process.env.NEXT_PUBLIC_INFURA_API_KEY);

  if (defaultChainId)
    return getReadonlyProvider(defaultChainId);

  return null;
};

export const switchToPolygon = () => {
  if (!window.ethereum) return

  const params = [{
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  }]

  window.ethereum.request({ method: 'wallet_addEthereumChain', params })
}

export const switchToRinkeby = () => {
  if (!window.ethereum) return

  window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4' }] })
}


export const switchToMainnet = () => {
  if (!window.ethereum) return

  window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] })
}