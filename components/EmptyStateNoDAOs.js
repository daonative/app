import { UserGroupIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { PrimaryButton } from "./Button";

const EmptyStateNoDAOs = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <UserGroupIcon className="h-24 w-24 m-8 text-daonative-text" />
    <h3 className="mt-2 text-lg font-medium text-daonative-white">{"You're not part of any DAO"}</h3>
    <Link passHref href="/onboarding">
      <PrimaryButton className="mt-3">Create your DAO</PrimaryButton>
    </Link>
  </div>
)

export default EmptyStateNoDAOs