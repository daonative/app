/* This example requires Tailwind CSS v2.0+ */
import { HeartIcon } from '@heroicons/react/solid'

export default function EmptyStateNoRewards({ children }) {
    return (
        <div className="flex flex-col items-center w-full">
            <HeartIcon className="w-12 h-12" />
            <h3 className="mt-2 text-sm font-medium text-daonative-gray-200">No rewards</h3>
            {children}
        </div>
    )
}