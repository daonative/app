import { UserGroupIcon } from "@heroicons/react/solid";
import { PrimaryButton } from "./Button";

const EmptyStateNoDAOs = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <UserGroupIcon className="h-24 w-24 m-8" />
    <h3 className="mt-2 text-lg font-medium text-daonative-gray-100">{"You're not part of any DAO"}</h3>
    <a href="https://daonative.xyz" target="_blank" rel="noreferrer" >
      <PrimaryButton>Request Access</PrimaryButton>
    </a>
  </div>
)

export default EmptyStateNoDAOs