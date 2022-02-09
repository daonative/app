import { arrayUnion, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Moment from 'react-moment';
import { useWallet } from 'use-wallet';
import useMembership from '../lib/useMembership';
import { mergeKPIsAndDefaults } from './KPIs';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';
import PFP from './PFP';
import ShortAddress from './ShortAddress';
import Spinner from './Spinner';

const ReviewModal = ({ show, onClose, event, KPIs }) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm()
  const { account } = useWallet()

  const metrics = mergeKPIsAndDefaults(KPIs)

  const addReview = async (data) => {
    const praise = parseInt(data.praise)
    const db = getFirestore()
    const eventRef = doc(db, 'feed', event.eventId)
    await updateDoc(eventRef, {
      praises: arrayUnion({ praise, impact: data.kpi, appraiser: account }),
      appraisers: arrayUnion(account)
    })
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={handleSubmit(addReview)}>
        <ModalTitle>Which goal does this help with?</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-y-6">
            <div>
              <ul className="flex flex-row gap-x-4 justify-center w-full">
                {Object.entries(metrics)
                  .filter(([_, metric]) => !!metric.name)
                  .map(([id, metric]) => (
                    <li key={metric.id} className="w-1/3 h-full grow">
                      <label className="flex flex-col justify-between items-center text-center gap-y-4 text-sm hover:cursor-pointer hover:bg-daonative-dark-200 p-4">
                        <input className="sr-only peer" type="radio" value={id} {...register('kpi', { required: true })} />
                        {metric.name}
                        <div className="peer-checked:bg-blue-100 bg-daonative-dark-100 rounded-full p-3">
                          <metric.icon className="h-8 w-8 text-blue-500" />
                        </div>
                      </label>
                    </li>
                  )
                  )}
              </ul>
              {errors.kpi && (
                <span className="text-xs text-red-400">You need to select a goal.</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                How much praise do you want to give?
              </label>
              <input type="number" {...register("praise", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300" />
              {errors.kpi && (
                <span className="text-xs text-red-400">You need to chose a praise amount.</span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 mx-auto"><Spinner /></span>
            ) : (
              <>Give praise</>
            )}
          </button>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const Feed = ({ feed, kpis, roomId }) => {
  const [reviewId, setReviewId] = useState()
  const metrics = mergeKPIsAndDefaults(kpis)
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isMember = !!membership

  const handleReviewWork = (id) => {
    setReviewId(id)
    console.log(id)
  }

  const handleCloseReviewModal = () => {
    setReviewId(undefined)
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 dark:border-daonative-gray-900 rounded-lg">
            <table className="table-fixed min-w-full divide-y divide-gray-200 dark:divide-daonative-gray-900">
              <thead className="bg-gray-50 dark:bg-daonative-dark-100 text-gray-500 dark:text-daonative-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Feed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Praise
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Date
                  </th>
                  {isMember && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {feed.map((event) => {
                  const totalPraise = event.praises?.reduce((total, currentPraise) => total + currentPraise.praise, 0)
                  const allImpacts = event.praises?.map(praise => praise.impact)
                  const impacts = allImpacts ? [...allImpacts] : []

                  const canReview = (
                    event.type === "work" &&
                    event.authorAccount !== account &&
                    !event.appraisers?.includes(account)
                  )

                  return (
                    <tr key={event.eventId} className="bg-white dark:bg-daonative-dark-100 text-gray-900 dark:text-daonative-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{event.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                        {totalPraise}
                        <div className="flex gap-2">
                          {impacts.map((id) => {
                            const ImpactIcon = metrics[id]?.icon
                            return ImpactIcon && <ImpactIcon className="h-4 w-4" />
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-4">
                          <PFP address={event.authorAccount} size={40} />
                          {/* <img className="h-10 w-10 rounded-full" src="https://ipfs.io/ipfs/QmbvBgaAqGVAs3KiEgsuDY2u4BUnuA9ueG96NFSPK4z6b6" alt="" />*/}
                          {event.authorName ? (
                            <>{event.authorName}</>
                          ) : (
                            <ShortAddress>{event.authorAccount}</ShortAddress>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Moment date={event.created} fromNowDuring={24 * 60 * 60 * 1000} format="yyyy-MM-DD" />
                      </td>
                      {isMember && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {canReview && (
                            <>
                              <span className="hover:cursor-pointer underline" onClick={() => handleReviewWork(event.eventId)}>Review</span>
                              <ReviewModal show={reviewId === event.eventId} onClose={handleCloseReviewModal} event={event} KPIs={kpis} />
                            </>
                          )}
                        </td>

                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;