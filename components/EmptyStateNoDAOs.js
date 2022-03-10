import { UserGroupIcon } from "@heroicons/react/solid";

const EmptyStateNoDAOs = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <UserGroupIcon className="h-24 w-24 m-8" />
    <h3 className="mt-2 text-lg font-medium text-daonative-gray-100">{"You're not part of any DAO"}</h3>
    <p className="mt-1 text-sm text-gray-500"><a href="https://daonative.xyz">Request early access</a></p>
  </div>
)

export default EmptyStateNoDAOs