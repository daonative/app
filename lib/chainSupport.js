import { providers } from 'ethers';

export const DEFAULT_CHAIN_ID = 137
export const isSupportedChain = (chainId) => [1, 137].includes(chainId);
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
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON);

  if (chainId === 4)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET);

  if (chainId === 1)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET);

  if (defaultChainId)
    return getReadonlyProvider(defaultChainId);

  return null;
};
