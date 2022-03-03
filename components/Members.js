import { Fragment, useEffect, useState } from "react"
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from "next/router"
import useMembership from "../lib/useMembership"
import { useWallet } from "use-wallet"

const InviteMemberModal = ({ open, onClose, inviteLink }) => (
  <Transition.Root show={open} as={Fragment}>
    <Dialog as="div" className="fixed z-40 inset-0 overflow-y-auto" onClose={onClose}>
      <div className="flex justify-center items-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="inline-block align-bottom  bg-daonative-dark-300 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div>
              <h3 className="text-xl p-4">Invite</h3>
            </div>
            <div className="p-4">
              <p className="text-sm pb-4">Share this link to allow people to join your DAO</p>
              <input
                type="text"
                value={inviteLink}
                className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300"
                disabled
              />
            </div>
            <div className="flex justify-end px-4 pb-4 pt-6">
              <button
                className="place-self-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
)

const Members = ({ members }) => {
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const { query } = useRouter()
  const { account } = useWallet()
  const membership = useMembership(account, query.daoId)
  const isAdmin = membership?.roles.includes('admin')

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  useEffect(() => {
    setInviteLink(`${window?.origin}/dao/${query.daoId}/join`)
  }, [])

  return (
    <>
      <InviteMemberModal open={open} onClose={closeModal} inviteLink={inviteLink} />
      <div className="bg-daonative-dark-100 p-4 shadow rounded-lg">
        <h3 className="text-daonative-gray-200">Members</h3>
        <p className="text-sm font-medium text-gray-500 text-daonative-gray-400">{members.length}</p>
        <ul role="list" className="divide-y divide-gray-200 w-full">
          {members.map((member, memberIdx) => (
            <li key={memberIdx} className="py-4 flex justify-between">
              <div className="">
                <p className="text-sm font-medium text-gray-900 text-daonative-gray-200">{member.name}</p>
                {member.praiseThisWeek && <p className="text-xs text-gray-500 text-daonative-gray-400">Praise received this week</p>}
              </div>
              <div className="place-self-end">
                <p className="text-sm text-gray-500 text-daonative-gray-400">{member.totalPraise}</p>
                <p className="text-xs font-medium text-green-500">{member.praiseThisWeek}</p>
              </div>
            </li>
          ))}
        </ul>
        {isAdmin && (
          <button
            className="place-self-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={openModal}
          >
            Add a member
          </button>
        )}
      </div>
    </>
  )
}

export default Members