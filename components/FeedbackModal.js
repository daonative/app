import { useState } from 'react';
import { useRouter } from 'next/router';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Spinner from './Spinner';
import { useWallet } from 'use-wallet';
import useMembership from '../lib/useMembership';
import toast from 'react-hot-toast';

const FeedbackModal = ({ show, onClose }) => {
  const { query: params } = useRouter();
  const roomId = params?.daoId;
  const { account } = useWallet();
  const membership = useMembership(account, roomId);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const submitFeedback = async (data) => {
    await axios.post('/api/feedback', { content: data.content, user: membership.name });
    toast.success('Feedback Submitted');
  };
  const handleSubmitFeedback = async (data) => {
    await submitFeedback(data);
    onClose();
    reset();
  };


  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Feedback</ModalTitle>
      <form onSubmit={handleSubmit(handleSubmitFeedback)}>
        <ModalBody>
          <textarea rows="8" {...register("content", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
        </ModalBody>
        <ModalActionFooter>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 mx-auto"><Spinner /></span>
            ) : (
              <>Submit Feedback</>
            )}
          </button>

        </ModalActionFooter>
      </form>
    </Modal>);
};
export const Feedback = () => {
  const { query: params } = useRouter();
  const roomId = params?.daoId;
  const { account } = useWallet();
  const membership = useMembership(account, roomId);
  const isMember = !!membership;


  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => {
    setShowModal((showModal) => !showModal);
  };

  const handleClose = () => {
    setShowModal(false);
  };



  if (!isMember)
    return <></>;

  return (
    <>
      <FeedbackModal show={showModal} onClose={handleClose} />
      <button
        onClick={handleShowModal}
        type="button"
        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Give Feedback on DAOnative
      </button>
    </>
  );
};
