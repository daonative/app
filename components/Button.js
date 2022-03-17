import { classNames } from '../lib/utils'

export const Button = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    className={
      classNames(
        "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:opacity-75 focus:outline-none bg-daonative-component-bg text-daonative-gray-100 h-max",
        className
      )
    }
    onClick={onClick}
  >
    {children}
  </button >
)

export const PrimaryButton = ({ children, onClick, type = "button", className = "", disabled = false }) => (
  <Button
    onClick={onClick}
    type={type}
    className={classNames(
      "bg-daonative-primary-blue",
      "shadow-daonative-blue",
      className,
      disabled && "bg-opacity-50"
    )}
    diabled={disabled}
  >
    {children}
  </Button>
)
// mx-2 w-max font-sans items-center px-4 py-2 border border-2 border-daonative-gray-100 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-daonative-border bg-daonative-component-bg text-daonative-gray-100 
export const SecondaryButton = ({ children, onClick, type = "button", className = "", disabled = false }) => (
  <Button
    onClick={onClick}
    type={type}
    className={classNames(
      className,
      disabled && "bg-opacity-50"
    )}
    disabled={disabled}
  >
    {children}
  </Button>
)

export default Button