import { classNames } from "../lib/utils"

export const SimpleCard = ({ onClick, children, className }) => {
  return (
    <div
      style={{

        background: 'linear-gradient(156.58deg, rgba(34,34,53, 0.9) 1.21%, rgba(245, 239, 255, 0) 156.94%)'
      }}
      onClick={onClick} className={classNames("bg-daonative-component-bg rounded-lg ", className)}>
      {children}
    </div >
  );
}
export const SimpleCardBody = ({ children, className }) => {
  return (
    <div className={classNames(" px-4 py-4 ", className)}>
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