import { classNames } from "../lib/utils"

export const SimpleCard = ({ onClick, children, className }) => {
  return (
    <div onClick={onClick} className={classNames("px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg", className)}>
      {children}
    </div>
  );
}


export const Card = ({ onClick, children, className }) => {
  return (
    <div onClick={onClick} className={classNames(
      "px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg",
      "hover:cursor-pointer opacity-[85%] hover:opacity-100",
      "drop-shadow-daonative",
      className
    )}>
      {children}
    </div>
  );
};