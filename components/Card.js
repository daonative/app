import { classNames } from "../lib/utils"

export const Card = ({ children, className }) => {
  console.log(className)
  return (
    <div className={classNames(
        "px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg",
        "drop-shadow-daonative hover:cursor-pointer opacity-[85%] hover:opacity-100",
        className
    )}>
      {children}
    </div>
  );
};
