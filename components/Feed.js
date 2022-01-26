import Moment from 'react-moment';

const feed = [
  { description: 'Deployed app.daonative.xyz', pfp: 'https://ipfs.io/ipfs/Qmc1DJWoEsVkjbJsMCnceFH1roF8QSnwK7iEhRKiBDqy9d', author: 'Laurent', date: new Date("Wed Jan 26 2022 18:19:37 GMT+0100") },
  { description: 'Landed our first user interview', pfp: 'https://ipfs.io/ipfs/QmbvBgaAqGVAs3KiEgsuDY2u4BUnuA9ueG96NFSPK4z6b6', author: 'Ben', date: new Date("Wed Jan 25 2022 18:19:37 GMT+0100") },
]

const Feed = () => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Feed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {feed.map((event, eventIdx) => (
                  <tr key={eventIdx} className={eventIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <img className="h-10 w-10 rounded-full" src={event.pfp} alt="" />
                        {event.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Moment date={event.date} fromNowDuring={24 * 60 * 60 * 1000} format="yyyy-MM-DD"/>
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