import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useForm } from 'react-hook-form';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';
import { useRequireAuthentication } from '../lib/authenticate';
import { PrimaryButton, SecondaryButton } from './Button';
import { uploadToIPFS } from '../lib/uploadToIPFS';
import { FileInput, TextField } from '@/components/Input';
import PFP from "./PFP";

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
    <Modal show={show} onClose={onClose}>
      <ModalTitle>DAO profile</ModalTitle>
      <form onSubmit={handleSubmit(handleUpdateDAOProfile)}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <DAOProfilePicture profilePictureURI={imageUri || room.profilePictureURI} roomId={roomId} />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">DAO profile picture</label>
              <FileInput name="image" register={register} />
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
        </ModalBody>
        <ModalActionFooter>
          <div className="flex gap-4">
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton type="submit">Save</PrimaryButton>
          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  );
};


export const DAOProfilePicture = ({ roomId, profilePictureURI }) => (
  <>
    {profilePictureURI && <img alt="DAO profile picture" src={profilePictureURI} width="64" height="64" style={{ borderRadius: 8 }} />}
    {!profilePictureURI && <PFP address={roomId} size={64} />}
  </>
)
