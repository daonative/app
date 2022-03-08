/* This example requires Tailwind CSS v2.0+ */
import { LightningBoltIcon, PlusIcon } from '@heroicons/react/solid'

export default function EmptyStateNoChallenges({ children }) {
    return (
        <div className="flex flex-col items-center w-full">
            <LightningBoltIcon className="w-12 h-12" />
            <h3 className="mt-2 text-sm font-medium text-daonative-gray-200">No challenges</h3>
            {children}
        </div>
    )
}