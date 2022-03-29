/* This example requires Tailwind CSS v2.0+ */
import { CheckIcon } from '@heroicons/react/solid'

const steps = [
    { name: 'Create an NFT collection', description: 'Click on "Create Collection" to deploy a no-code NFT collection smart contract', href: '#', status: 'current' },
    { name: 'Generate a unique minting link', description: 'Penatibus eu quis ante.', href: '#', status: 'upcoming' },
    { name: 'Share it with your community members', description: 'Iusto et officia maiores porro ad non quas.', href: '#', status: 'upcoming' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function NFTSteps() {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
                        {step.status === 'complete' ? (
                            <>
                                {stepIdx !== steps.length - 1 ? (
                                    <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-daonative-primary-blue" aria-hidden="true" />
                                ) : null}
                                <a href={step.href} className="relative flex items-center group">
                                    <span className="h-9 flex items-center">
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-daonative-primary-blue rounded-full group-hover:bg-indigo-800">
                                            <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                        </span>
                                    </span>
                                    <span className="ml-4 min-w-0 flex flex-col">
                                        <span className="text-xs font-semibold tracking-wide uppercase">{step.name}</span>
                                    </span>
                                </a>
                            </>
                        ) : step.status === 'current' ? (
                            <>
                                {stepIdx !== steps.length - 1 ? (
                                    <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                                ) : null}
                                <a href={step.href} className="relative flex items-start group" aria-current="step">
                                    <span className="h-9 flex items-center" aria-hidden="true">
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-daonative-primary-blue rounded-full">
                                            <span className="h-2.5 w-2.5 bg-daonative-primary-blue rounded-full" />
                                        </span>
                                    </span>
                                    <span className="ml-4 min-w-0 flex flex-col">
                                        <span className="text-xs font-semibold tracking-wide uppercase text-daonative-white">{step.name}</span>
                                    </span>
                                </a>
                            </>
                        ) : (
                            <>
                                {stepIdx !== steps.length - 1 ? (
                                    <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                                ) : null}
                                <a href={step.href} className="relative flex items-start group">
                                    <span className="h-9 flex items-center" aria-hidden="true">
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                                            <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" />
                                        </span>
                                    </span>
                                    <span className="ml-4 min-w-0 flex flex-col">
                                        <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">{step.name}</span>
                                    </span>
                                </a>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
