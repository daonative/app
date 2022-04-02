import { classNames } from "../lib/utils"

export const SimpleCard = ({ children, className }) => {
  return (
    <div className={classNames(
      "px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg",
      className
    )}>
      {children}
    </div>
  );
}


export const Card = ({ children, className }) => {
  return (
    <div className={classNames(
      "px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg",
      "hover:cursor-pointer opacity-[85%] hover:opacity-100",
      "drop-shadow-daonative",
      className
    )}>
      {children}
    </div>
  );
};
