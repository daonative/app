import {classNames} from '../lib/utils'

export const Button = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    className={classNames(
      "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
)

export const PrimaryButton = ({ children, onClick, type = "button", className = ""}) => (
  <Button onClick={onClick} type={type} className={classNames("bg-daonative-primary-blue ", className)}>{children}</Button>
)

export default Button