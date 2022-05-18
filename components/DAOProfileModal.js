import { getFirestore, doc, updateDoc, collection, addDoc, serverTimestamp, query, where, deleteDoc } from "firebase/firestore";
import { useForm } from 'react-hook-form';
import { Modal, ModalActionFooter, ModalBody, ModalTabs, ModalTitle } from './Modal';
import { useRequireAuthentication } from '../lib/authenticate';
import { PrimaryButton, SecondaryButton } from './Button';
import { uploadToIPFS } from '../lib/uploadToIPFS';
import { FileInput, Select, TextField } from '@/components/Input';
import PFP from "./PFP";
import { classNames } from "@/lib/utils";
import { Tab } from "@headlessui/react";
import { useAccount } from "wagmi";
import { useCollection } from "react-firebase-hooks/firestore";

const computeTabStyling = (selected) => {
  return classNames(
    selected
      ? 'border-indigo-500 text-indigo-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
  )
}

const AdvancedSettings = ({ roomId }) => {
  const { data: account } = useAccount()
  const { handleSubmit, register, formState: { isSubmitSuccessful } } = useForm({ defaultValues: {} });
  const requireAuthentication = useRequireAuthentication();

  const db = getFirestore();

  // missing query all previous token gates
  const [gatesSnap] = useCollection(
    query(collection(db, 'gates'), where('roomId', '==', roomId || 'x'))
  )

  const gates = gatesSnap?.docs?.map(doc => ({ gateId: doc.id, ...doc.data() })) || []


  const handleUpdateAdvancedSettings = async (data) => {
    await requireAuthentication()
    const requirements = { chainId: 1, contractAddress: data.contractAddress, roomId, tokenId: 1, type: data.type, created: serverTimestamp(), creator: account.address }
    const gates = collection(db, 'gates')
    await addDoc(gates, requirements)
  };

  const handleDelete = async (docId) => {
    await requireAuthentication()
    await deleteDoc(doc(db, 'gates', docId))
  }


  return (

    <form onSubmit={handleSubmit(handleUpdateAdvancedSettings)}>
      <div className="flex flex-col gap-4 mt-8">
        <div className="text-daonative-subtitle">Active token-gates</div>
        {gates.map(gate => <div key={gate.gateId} className="flex gap-3"><div >{gate.contractAddress}</div><div className="cursor-pointer" onClick={() => handleDelete(gate.gateId)}>x</div></div>) }
        <div className="flex items-center gap-5">
          <div>
            <TextField label="Enter the contract address" name="contractAddress" placeholder={`0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D`} register={register} required />
          </div>
          <div>
            <Select label="Choose the contract type" name="type" register={register}>
              <option value="ERC721">ERC721</option>
              <option disabled value="ERC1155">ERC1155 (coming soon)</option>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-end py-4 ">
        <PrimaryButton type="submit">{isSubmitSuccessful ? 'Success' : 'Save'}</PrimaryButton>
      </div>
    </form>
  )
}

export const DAOProfileModal = ({ room, roomId, show, onClose }) => {
  const { discordNotificationWebhook, twitterHandle, discordServer } = room;
  const { handleSubmit, register, watch } = useForm({ defaultValues: { discordNotificationWebhook, twitterHandle, discordServer } });
  const imageFile = watch('image');
  const imageUri = imageFile?.length > 0 ? URL.createObjectURL(imageFile[0]) : "";
  const requireAuthentication = useRequireAuthentication();



  const uploadProfilePicture = async (image) => {
    if (image?.length !== 1)
      return null;

    const profilePictureURI = await uploadToIPFS(image[0]);
    return profilePictureURI;
  };

  const updateDAOProfile = async (image, daoData) => {
    const db = getFirestore();
    const roomRef = doc(db, 'rooms', roomId);
    const profilePictureURI = await uploadProfilePicture(image);
    const daoProfile = profilePictureURI ? { profilePictureURI, ...daoData } : { ...daoData };
    await updateDoc(roomRef, daoProfile);
  };

  const handleUpdateDAOProfile = async (data) => {
    await requireAuthentication();
    const { image, ...daoProfile } = data;
    await updateDAOProfile(image, daoProfile);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} >

      <Tab.Group>
        <ModalTitle>DAO Settings</ModalTitle>
        <ModalTabs>
          <Tab.List className={'flex gap-3'}>
            <Tab className={({ selected }) => computeTabStyling(selected)}
            >
              Profile
            </Tab>

            <Tab className={({ selected }) => computeTabStyling(selected)}
            >
              Token-gating
            </Tab>
          </Tab.List>
        </ModalTabs>
        <Tab.Panels>
          <Tab.Panel>
            <ModalBody>
              <form onSubmit={handleSubmit(handleUpdateDAOProfile)}>
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-5">
                    <DAOProfilePicture profilePictureURI={imageUri || room.profilePictureURI} roomId={roomId} />
                    <div>
                      <label className="block text-sm font-medium pb-2">Choose a profile picture</label>
                      <FileInput name="image" register={register} />
                    </div>
                  </div>
                  <div>
                    <TextField type="url" label="Discord Webhook URL" name="discordNotificationWebhook" register={register} placeholder="https://discord.com/api/webhooks/..." />
                  </div>
                  <div>
                    <TextField label="Twitter Handle" name="twitterHandle" register={register} placeholder="@DAOnative" />
                  </div>
                  <div>
                    <TextField type="url" label="Discord Server" name="discordServer" register={register} placeholder="https://discord.gg/vRyrqCQhWd" />
                  </div>
                </div>
                <div className="flex gap-4 justify-end py-4 ">
                  <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                  <PrimaryButton type="submit">Save</PrimaryButton>
                </div>
              </form>
            </ModalBody>
          </Tab.Panel>
          <Tab.Panel>
            <ModalBody>
              <AdvancedSettings roomId={roomId} />
            </ModalBody>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group >
    </Modal >
  );
};


export const DAOProfilePicture = ({ roomId, profilePictureURI }) => (
  <>
    {profilePictureURI && <img alt="DAO profile picture" src={profilePictureURI} width="64" height="64" style={{ borderRadius: 8 }} />}
    {!profilePictureURI && <PFP address={roomId} size={64} />}
  </>
)
