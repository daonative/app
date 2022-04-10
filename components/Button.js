import { classNames } from '../lib/utils'

export const Button = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    className={
      classNames(
        "inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md hover:opacity-75 focus:outline-none text-daonative-white h-max",
        className
      )
    }
    onClick={onClick}
  >
    {children}
  </button >
)

export const PrimaryButton = ({ children, onClick = () => null, type = "button", className = "", disabled = false }) => (
  <Button
    onClick={onClick}
    type={type}
    className={classNames(
      "bg-daonative-primary-blue",
      "shadow-daonative-blue",
      "w-max",
      disabled && "opacity-50 hover:opacity-50 hover:cursor-default",
      className,
    )}
    diabled={disabled}
  >
    {children}
  </Button>
)
// mx-2 w-max font-sans items-center px-4 py-2 border border-2 border-daonative-gray-100 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-daonative-border bg-daonative-component-bg text-daonative-gray-100 
export const SecondaryButton = ({ children, onClick, type = "button", className = "", disabled = false }) => (
  <Button
    onClick={() => !disabled && onClick && onClick()}
    type={type}
    className={classNames(
      className,
      'bg-daonative-component-bg',
      disabled && "opacity-50 hover:opacity-50 hover:cursor-default",
    )}
    disabled={disabled}
  >
    {children}
  </Button>
)

export default Button