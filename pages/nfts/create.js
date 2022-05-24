import { useForm } from "react-hook-form";
import { useWallet } from "@/lib/useWallet";
import { PrimaryButton } from "../../components/Button";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { collectionCreatorAbi } from "../../lib/abi";
import toast from "react-hot-toast";
import Link from "next/link";
import { LayoutWrapper } from "../../components/LayoutWrapper";
import Spinner from "../../components/Spinner";
import { useRouter } from "next/router";
import { HeartIcon } from "@heroicons/react/outline";
import ConnectWalletButton from "../../components/ConnectWalletButton";

import { Disclosure, Transition } from "@headlessui/react";
import { ChevronRightIcon, PhotographIcon } from "@heroicons/react/solid";

import { classNames } from "../../lib/utils";
import { translateURI } from "../../lib/translateURI";
import useUserProfile from "../../lib/useUserProfile";

import PolygonLogo from "../../public/PolygonLogo.svg";
import EthereumLogo from "../../public/EthereumLogo.svg";
import {
  getCollectionCreatorAddress,
  isSupportedChain,
  switchToMainnet,
  switchToPolygon,
  switchToRinkeby,
} from "../../lib/chainSupport";
import {
  SwitchToMainnetButton,
  SwitchToPolygonButton,
  SwitchToRinkebyButton,
} from "../../components/ChainWarning";
import { uploadToIPFS } from "../../lib/uploadToIPFS";
import { useSigner } from "wagmi";
import { FileInput, TextField } from "@/components/Input";

const CollectionForm = ({ onImage, onMetadata, onName }) => {
  const { account, chainId } = useWallet();
  const { data: signer } = useSigner();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();
  const router = useRouter();

  const [watchMetadata, watchImage, watchName] = watch(["metadata", "image", "name"]);

  useEffect(() => {
    onMetadata(watchMetadata);
  }, [onMetadata, watchMetadata]);

  useEffect(() => {
    onImage(watchImage);
  }, [onImage, watchImage]);

  useEffect(() => {
    onName(watchName);
  }, [onName, watchName]);

  const uploadImageAndMetadata = async (name, image) => {
    const imageUri = await uploadToIPFS(image[0]);
    const metadata = {
      image: imageUri,
      name,
    };
    const metadataUri = await uploadToIPFS(JSON.stringify(metadata));
    return metadataUri;
  };

  const uploadOnlyMetadata = async (metadata) => {
    const metadataUri = await uploadToIPFS(metadata);
    return metadataUri;
  };

  const createCollection = async (
    name,
    symbol,
    image,
    metadata,
    oneTokenPerAddress,
    maxSupply,
    endDateTime,
  ) => {
    if (image?.length > 0 && metadata) {
      throw Error(
        "Cannot create a collection when both an image is uploaded and metadata is provided.",
      );
    }

    if (!isSupportedChain(chainId)) {
      throw Error("Unsupported chain");
    }

    const contractAddress = getCollectionCreatorAddress(chainId);
    const contract = new ethers.Contract(contractAddress, collectionCreatorAbi, signer);
    const metadataUri = metadata
      ? await uploadOnlyMetadata(metadata)
      : await uploadImageAndMetadata(name, image);
    const maxOrInfiniteSupply = maxSupply ? maxSupply : 0;
    const endTimeStamp = endDateTime ? new Date(endDateTime).getTime() / 1000 : 0;
    return await contract.createCollection(
      name,
      symbol,
      metadataUri,
      oneTokenPerAddress,
      endTimeStamp,
      maxOrInfiniteSupply,
    );
  };

  const getNewCollectionAddressFromTxReceipt = (txReceipt) => {
    const collectionCreatorInterface = new ethers.utils.Interface(collectionCreatorAbi);
    return (
      txReceipt.logs
        // Parse log events
        .map((log) => {
          try {
            const event = collectionCreatorInterface.parseLog(log);
            return event;
          } catch (e) {
            return undefined;
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
    );
  };

  const handleCreateCollection = async (data) => {
    const toastId = toast.loading("Deploying your NFT collection");
    try {
      const newCollectionTx = await createCollection(
        data.name,
        data.symbol,
        data.image,
        data.metadata,
        data.oneTokenPerAddress,
        data.maxSupply,
        data.endDateTime,
      );
      const newCollectionReceipt = await newCollectionTx.wait();
      const newCollectionAddress = getNewCollectionAddressFromTxReceipt(newCollectionReceipt);
      toast.success("NFT collection created", { id: toastId });
      router.push(`${router.asPath.replace("/create", "")}/${chainId}/${newCollectionAddress}`);
      reset();
    } catch (e) {
      toast.error("Failed to create NFT collection", { id: toastId });
      toast.error(e.message);
    }
  };

  const checkMetaDataOrImage = (image, metadata) => {
    if (image.length > 0 && !metadata) return true;
    if (image.length === 0 && metadata) return true;
    return false;
  };

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit(handleCreateCollection)}>
      <div className="flex flex-col gap-4">
        <div>
          <TextField
            name="name"
            label="Collection Name"
            register={register}
            required
            placeholder="Nouns"
          />
          {errors.name && <span className="text-xs text-red-400">You need to set a name</span>}
        </div>
        <div>
          <TextField name="symbol" label="Symbol" placeholder="NTV" required register={register} />
          {errors.symbol && <span className="text-xs text-red-400">You need to set a symbol</span>}
        </div>
        <Disclosure>
          {({ open }) => (
            <>
              <div>
                <label className="block text-sm font-medium pb-2">Image</label>

                <FileInput
                  name="image"
                  register={register}
                  validate={{
                    metaOrImage: (value) => checkMetaDataOrImage(value, getValues("metadata")),
                  }}
                />
                {!open &&
                  (errors?.image?.type === "metaOrImage" ||
                    errors?.metadata?.type === "metaOrImage") && (
                    <span className="block text-xs text-red-400 pt-2">
                      You need to set an image
                    </span>
                  )}
              </div>
              <div>
                <TextField
                  name="maxSupply"
                  placeholder="20"
                  label="Max Mintable NFT"
                  register={register}
                />
              </div>
              <div>
                <label className="block text-sm font-medium py-2">
                  Can be minted until (UTC) (optional)
                </label>
                <input
                  type="datetime-local"
                  {...register("endDateTime", { required: false })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent "
                />
              </div>
              <div>
                <input
                  type="checkbox"
                  {...register("oneTokenPerAddress", { required: false })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 inline-block sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent "
                />
                <label className="inline-block text-sm font-medium py-2 pl-2">
                  Allow only one token per address (no double minting)
                </label>
              </div>
              <Disclosure.Button className="flex w-full justify-end text-sm text-daonative-subtitle">
                <div className="flex items-center">
                  <ChevronRightIcon
                    className={classNames("w-5 h-5", open && "transform rotate-90")}
                  />

                  <span>Show advanced settings</span>
                </div>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel>
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-xs text-daonative-subtitle py-4 ">
                        💡 When setting metadata the image field will be ignored.
                      </span>
                      <label className="block text-sm font-medium py-2">Metadata</label>
                      <textarea
                        {...register("metadata", {
                          required: false,
                          validate: {
                            metaOrImage: (value) => checkMetaDataOrImage(getValues("image"), value),
                            json: (value) => !value || isValidJSON(value),
                          },
                        })}
                        rows={8}
                        placeholder={
                          '{\n"image":"https://ipfs.infura.io/ipfs/QmcnySmHZNj9r5gwS86oKsQ8Gu7qPxdiGzvu6KfE1YKCSu",\n"name":"DAOnative Membership",\n"description":""\n}'
                        }
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent"
                      />
                      {open &&
                        (errors?.image?.type === "metaOrImage" ||
                          errors?.metadata?.type === "metaOrImage") && (
                          <span className="block text-xs text-red-400 pt-2">
                            You need to set either an image or metadata
                          </span>
                        )}
                      {errors?.metadata?.type === "json" && (
                        <span className="block text-xs text-red-400">
                          Metadata should be a valid JSON format
                        </span>
                      )}
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
      <div className="flex justify-between items-center w-full pt-8">
        <Link href="/nfts/faq">
          <a className="underline text-sm">How does this work?</a>
        </Link>
        <div>
          <PrimaryButton type="sumbit" disabled={isSubmitting}>
            {isSubmitting && (
              <span className="w-4 h-4 mr-2">
                <Spinner />
              </span>
            )}
            Create collection
          </PrimaryButton>
        </div>
      </div>
      <div className="flex gap-1 text-xs text-daonative-subtitle py-4">
        <span>💡</span>
        <div>
          <div>
            {"You're connected to "}
            {chainId === 1 && "Ethereum Mainnet"}
            {chainId === 4 && "Ethereum Rinkeby (testnet)"}
            {chainId === 137 && "Polygon mainnet"}.
          </div>
          {chainId === 1 && (
            <>
              <div>
                Want to try it out without paying the high gas fees? Use{" "}
                <span
                  className="underline hover:text-daonative-primary-purple hover:cursor-pointer"
                  onClick={switchToRinkeby}
                >
                  Rinkeby
                </span>{" "}
                or{" "}
                <span
                  className="underline hover:text-daonative-primary-purple hover:cursor-pointer"
                  onClick={switchToPolygon}
                >
                  Polygon
                </span>
                .
              </div>
              <div className="pt-2">
                Have questions?{" "}
                <a
                  href="https://discord.gg/m3mC5f4jBU"
                  className="underline hover:text-daonative-primary-purple"
                >
                  Ask us on discord!
                </a>
              </div>
            </>
          )}
          {chainId === 4 && (
            <>
              <div>
                Need Rinkeby ETH for gas to try it out? Have questions?{" "}
                <a
                  href="https://discord.gg/m3mC5f4jBU"
                  className="underline hover:text-daonative-primary-purple"
                >
                  Ask us on discord!
                </a>
              </div>
              <div className="pt-2">
                Ready to deploy on{" "}
                <span
                  className="underline hover:text-daonative-primary-purple hover:cursor-pointer"
                  onClick={switchToMainnet}
                >
                  Mainnet
                </span>
                ?
              </div>
            </>
          )}
          {chainId === 137 && (
            <>
              <div>
                Need MATIC for gas to try it out? Have questions?{" "}
                <a
                  href="https://discord.gg/m3mC5f4jBU"
                  className="underline hover:text-daonative-primary-purple"
                >
                  Ask us on discord!
                </a>
              </div>
              <div className="pt-2">
                Ready to deploy on{" "}
                <span
                  className="underline hover:text-daonative-primary-purple hover:cursor-pointer"
                  onClick={switchToMainnet}
                >
                  Mainnet
                </span>
                ?
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export const ImagePreview = ({ uri }) => {
  return (
    <div className="flex items-center justify-center h-full p-2" style={{ maxWidth: 350 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {uri ? (
        <img src={uri} className="h-auto w-full" alt="Your token artwork" />
      ) : (
        <PhotographIcon className="text-daonative-dark-100 w-32" />
      )}
    </div>
  );
};

export const OpenSeaPreview = ({ collectionName, metadata, chainId }) => {
  const imageUri = translateURI(metadata.image);
  const tokenName = metadata.name;
  const { account } = useWallet();
  const { displayName } = useUserProfile(account);

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex flex-col border border-daonative-border  rounded w-96 min-h-[18em] overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div>
            {chainId === 1 && <EthereumLogo className="w-4 h-4" />}
            {chainId === 4 && <EthereumLogo className="w-4 h-4" />}
            {chainId === 137 && <PolygonLogo className="w-4 h-4" />}
          </div>
          <div className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            <span className="text-xs">0</span>
          </div>
        </div>
        <ImagePreview uri={imageUri} />
      </div>
      <div>
        <div className="text-xs text-daonative-primary-purple h-12 inline-flex items-center font-bold">
          {collectionName || "DAOnative Core"}
        </div>
        <div className="text-lg text-daonative-white">
          {!tokenName && !collectionName ? "DAOnative Core" : tokenName || ""} #1
        </div>
        <div className="text-xs text-daonative-subtitle">
          owned by <span className="text-daonative-primary-purple">{displayName}</span>
        </div>
      </div>
    </div>
  );
};

export const CreateNFT = () => {
  const { account, chainId } = useWallet();
  const [formImage, setFormImage] = useState(null);
  const [formName, setFormName] = useState("");
  const [formMetadata, setFormMetadata] = useState({});
  const [previewMetadata, setPreviewMetadata] = useState({});

  useEffect(() => {
    setPreviewMetadata({});

    if (formImage?.length > 0 && formMetadata) return;

    if (formMetadata) {
      try {
        setPreviewMetadata(JSON.parse(formMetadata));
      } catch (e) {
        setPreviewMetadata({});
      }
      return;
    }

    if (formImage?.length > 0 || formName) {
      const imageURI = formImage.length > 0 ? URL.createObjectURL(formImage[0]) : "";
      setPreviewMetadata({
        image: imageURI,
        name: formName,
      });
      return;
    }
  }, [formImage, formName, formMetadata]);

  return (
    <div className="text-daonative-white">
      <div className="flex justify-center px-8">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-space">NFT Collection Creator</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-100">
              {
                "Create an NFT collection and share a minting link to your community. For example, you can use it combination with https://guild.xyz to easily create token-gated chat servers."
              }
            </p>
          </div>
          <div className="w-full">
            {!account && (
              <ConnectWalletButton>
                <PrimaryButton>Connect your wallet</PrimaryButton>
              </ConnectWalletButton>
            )}
            {account && !isSupportedChain(chainId) && (
              <div className="flex flex-col gap-4 mt-8 items-center">
                <span className="text-daonative-subtitle">
                  Connect to a supported network to create your collection.
                </span>
                <SwitchToMainnetButton />
                <SwitchToRinkebyButton />
                <SwitchToPolygonButton />
              </div>
            )}
            {account && isSupportedChain(chainId) && (
              <div className="flex gap-8 flex-col lg:flex-row">
                <div className="grow max-w-md">
                  <CollectionForm
                    onImage={setFormImage}
                    onMetadata={setFormMetadata}
                    onName={setFormName}
                  />
                </div>
                <div className="flex-none">
                  <OpenSeaPreview
                    metadata={previewMetadata}
                    collectionName={formName}
                    chainId={chainId}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateNFTPage = () => {
  return (
    <LayoutWrapper>
      <CreateNFT />
    </LayoutWrapper>
  );
};

export default CreateNFTPage;
