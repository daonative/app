import React from 'react'
import { CheckIcon } from "@heroicons/react/solid"
import { PrimaryButton } from "./Button"
import { UserName } from "./PFP"
import { Modal, ModalBody, ModalTitle } from "./Modal"

import { kFormatter } from '@/lib/utils'

const LeaderboardProfileModal = ({ show, onClose, leaderboardProfile }) => {
  const { account, verifiedXps, submissionCount } = leaderboardProfile
  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>
        <div className="4 mx-auto  flex flex-col ">
          <div className='flex justify-between'>
            <div className='flex flex-col gap-3'>
              <h1 className="text-xl">
                <UserName account={account} />
              </h1>
              <div className="relative flex flex-col">
                <div className="flex flex-col justify-between w-full ">
                  <span className="text-xs text-daonative-subtitle">Role</span>
                  <h2 className="text-m">
                    Guild Hero
                  </h2>

                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div>
                <span className="py-0.5 px-4 text-sm rounded-md font-medium bg-blue-100 text-blue-800 font-weight-600 font-space text-center inline">
                  {kFormatter(verifiedXps)} XPs
                </span>
              </div>

              <div className="text-daonative-subtitle text-sm flex">
                <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                {submissionCount} Challenges Completed
              </div>
            </div>
          </div>
        </div>

      </ModalTitle>
      <ModalBody>
        <div className="flex justify-between w-full items-end pt-8 ">
          <div>
            <h2 className="text-xl">Latest Rewards</h2>
          </div>
        </div>
        <div className="flex gap-6 relative justify-between">
          <div className="flex gap-6 ">
            <div className="absolute top-0 left-0 w-full h-full bg-daonative-dark-300 bg-opacity-80">
              <div className="flex items-center justify-center text-3xl pt-20">
                Coming soon
              </div>
            </div>

            <div>
              <span className="text-xs text-daonative-subtitle">Undefined contract #5</span>
              <img src="https://arweave.net/Jf6CQMTDHpNu2jpGrwTSr6V9hdsp7geyqQM0xypenTE" className="w-32 rounded-md" />
            </div>
            <div>
              <span className="text-xs text-daonative-subtitle">Early Adopters Gen 1</span>
              <img src="https://ipfs.infura.io/ipfs/QmcebJ4PbN3yXKSZoKdf7y7vBo5T4X98VKGULnkdFnAK2m" className="w-32 rounded-md" />
            </div>

          </div>
          <div className='flex flex-col gap-3'>
            <div className="flex gap-1">
              <span className="">{Math.floor(verifiedXps / 10)}</span>
              <span className="text-daonative-subtitle ">$GREEN</span>
            </div>
            <PrimaryButton disabled={true}>Claim</PrimaryButton>
          </div>
        </div>
      </ModalBody>
    </Modal >
  )
}

export default LeaderboardProfileModal