import Moment from 'react-moment';
import PFP from './PFP';
import ShortAddress from './ShortAddress';

const Feed = ({ feed }) => {
  const reviewWork = (id) => {
    console.log(id)
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
                    className="px-6 py-3 w-48 text-left text-xs font-medium uppercase tracking-wider"
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
                        <span className="hover:cursor-pointer underline" onClick={() => reviewWork(event.eventId)}>Review</span>
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