import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Moment from 'react-moment';
import { mergeKPIsAndDefaults } from './KPIs';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';
import PFP from './PFP';
import ShortAddress from './ShortAddress';

const ReviewModal = ({ show, onClose, onSave, eventId, KPIs }) => {
  const { register, handleSubmit, watch } = useForm()

  const metrics = mergeKPIsAndDefaults(KPIs)

  const addReview = (data) => {
    onSave(data)
    onClose()
  }

  console.log(watch())

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={handleSubmit(addReview)}>
        <ModalTitle>Which goal does this help with?</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-y-6">
            <ul className="flex flex-row gap-x-4 justify-center w-full">
              {Object.entries(metrics)
                .filter(([_, metric]) => !!metric.name)
                .map(([id, metric]) => (
                  <li key={metric.id} className="w-1/3 h-full grow">
                    <label className="flex flex-col justify-between items-center text-center gap-y-4 text-sm hover:cursor-pointer hover:bg-daonative-dark-200 p-4">
                      <input className="sr-only peer" type="radio" value={id} {...register('kpi')} />
                      {metric.name}
                      <div className="peer-checked:bg-blue-100 bg-daonative-dark-100 rounded-full p-3">
                        <metric.icon className="h-8 w-8 text-blue-500" />
                      </div>
                    </label>
                  </li>
                )
                )}
            </ul>
            <div>
              <label htmlFor="name" className="block text-sm font-medium pb-2">
                How much praise do you want to give?
              </label>
              <input type="text" {...register("name")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300" />
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100"
          >
            Give praise
          </button>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const Feed = ({ feed, kpis }) => {
  const [reviewId, setReviewId] = useState()

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
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {feed.map((event) => (
                  <tr key={event.eventId} className="bg-white dark:bg-daonative-dark-100 text-gray-900 dark:text-daonative-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{event.description}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {event.type === "work" && (
                        <>
                          <span className="hover:cursor-pointer underline" onClick={() => handleReviewWork(event.eventId)}>Review</span>
                          <ReviewModal show={reviewId === event.eventId} onClose={handleCloseReviewModal} eventId={event.eventId} KPIs={kpis} />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;