import { Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton, SecondaryButton } from "./Button";
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from "./Modal";
import toast from "react-hot-toast";
import { ClipboardCopyIcon } from "@heroicons/react/solid";

export const InviteMemberModal = ({ open, onClose, inviteLink }) => {
  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink)
    toast.success('Copied invite link to clipboard', { icon: <ClipboardCopyIcon className="h-6 w-6 text-green" /> })
  }

  return (
    <Modal show={open} onClose={onClose}>
      <ModalTitle>Invite</ModalTitle>
      <ModalBody>

        <p className="text-sm pb-4">Share this link to allow people to join your DAO</p>
        <input
          type="text"
          value={inviteLink}
          className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300"
          disabled />

      </ModalBody>
      <ModalActionFooter>
        <div className="flex justify-between w-full">
          <SecondaryButton
            onClick={onClose}
          >
            Close
          </SecondaryButton>
          <PrimaryButton onClick={handleCopyToClipboard} >
            <ClipboardCopyIcon className="h-4 w-4 mr-1" />
            Copy to clipboard
          </PrimaryButton>
        </div>
      </ModalActionFooter>

    </Modal >
  )
}
