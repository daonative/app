import { useState } from 'react';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useForm } from 'react-hook-form';
import useMembership from '../lib/useMembership';
import { useWallet } from '@/lib/useWallet';
import { useRequireAuthentication } from '../lib/authenticate';

export const DAOMission = ({ roomId, mission }) => {
  const [showForm, setShowForm] = useState(false);
  const [currentMission, setCurrentMission] = useState(mission);
  const { register, handleSubmit } = useForm({ defaultValues: { mission } });
  const { account } = useWallet();
  const membership = useMembership(account, roomId);
  const requireAuthentication = useRequireAuthentication();
  const isAdmin = membership?.roles?.includes('admin');

  const setMission = async (data) => {
    const db = getFirestore();
    await requireAuthentication();

    const { mission } = data;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { mission });

    setCurrentMission(mission);
    setShowForm(false);
  };

  const handleEditClick = () => setShowForm(true);

  if (showForm) {
    return (
      <form onSubmit={handleSubmit(setMission)}>
        <input type="text" {...register('mission')} className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
      </form>
    );
  }

  return (
    <p className="py-2 text-sm">
      {isAdmin ? (
        <span onClick={handleEditClick} className="hover:cursor-pointer">
          {currentMission || "Write your mission here..."}
        </span>
      ) : (
        <>{currentMission}</>
      )}
    </p>
  );
};
