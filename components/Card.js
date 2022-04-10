import { classNames } from "../lib/utils"

export const SimpleCard = ({ onClick, children, className }) => {
  return (
    <div
      style={{
        border: '1px solid rgba(49, 49, 74, 0.4)',
      }}
      onClick={onClick} className={classNames("bg-daonative-component-bg rounded-lg ", className)}>
      {children}
    </div >
  );
}
export const SimpleCardBody = ({ children, className }) => {
  return (
    <div className={classNames(" px-3 py-3 ", className)}>
      {children}
    </div >
  )
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