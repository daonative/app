import {
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  ChartBarIcon,
  MailOpenIcon,
  CursorClickIcon
} from '@heroicons/react/solid';
import { classNames } from "../lib/utils";

const stats = [
  { name: 'DAOs organized', stat: '10', icon: ChartBarIcon, change: '2', changeType: 'increase' },
  { name: 'Waitinglist', stat: '6', icon: MailOpenIcon, change: '2', changeType: 'increase' },
  { name: 'Proposals', stat: '3', icon: CursorClickIcon },
]

const KPIs = () => {
  return (
    <div>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item, itemIdx) => (
          <div
            key={itemIdx}
            className="relative bg-white pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-blue-100 rounded-full p-3">
                <item.icon className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              {item.change && (
                <p
                  className={classNames(
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  )}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowSmUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowSmDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" aria-hidden="true" />
                  )}

                  <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                  {item.change}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default KPIs