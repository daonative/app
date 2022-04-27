import { classNames } from "../lib/utils"

export const SimpleCard = ({ onClick, children, className }) => {
  return (
    <div
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
    <SimpleCard onClick={onClick} className={classNames(className, onClick && 'opacity-75 hover:opacity-100', 'cursor-pointer')}>
      <SimpleCardBody>
        {children}
      </SimpleCardBody>
    </SimpleCard>
  );
};