import { classNames } from "@/lib/utils";

export const computeTabStyling = (selected) => {
  return classNames(
    selected
      ? 'border-indigo-500 text-indigo-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
  );
};
