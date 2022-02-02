import {
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  CalendarIcon,
  MailOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/solid';
import { classNames } from "../lib/utils";

const daysToLaunch = Math.floor((new Date('2022-02-11T00:00:00') - new Date())/ (1000 * 3600 * 24))

const stats = [
  { name: 'Days to launch', stat: daysToLaunch.toString(), icon: CalendarIcon, },
  { name: 'Waitinglist', stat: '11', icon: MailOpenIcon },
  { name: 'User interviews output', stat: '5', icon: AcademicCapIcon },
]

const KPIs = () => {
  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {stats.map((item, itemIdx) => (
          <div
            key={itemIdx}
            className="relative bg-white pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden dark:bg-daonative-dark-100"
          >
            <dt>
              <div className="absolute bg-blue-100 rounded-full p-3">
                <item.icon className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate dark:text-daonative-gray-300">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">{item.stat}</p>
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