import { classNames } from '../lib/utils'

export const Button = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    style={{
      boxShadow: '0px 0px 14px rgba(47, 73, 209, 0.6)'
    }}
    className={
      classNames(
        "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-daonative-border bg-daonative-dark-100 text-daonative-gray-100 h-max",
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
      className,
      disabled && "bg-opacity-50"
    )}
    diabled={disabled}
  >
    {children}
  </Button>
)
// mx-2 w-max font-sans items-center px-4 py-2 border border-2 border-daonative-gray-100 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-daonative-border bg-daonative-dark-100 text-daonative-gray-100 
export const SecondaryButton = ({ children, onClick, type = "button", className = "" }) => (
  <Button onClick={onClick} type={type} className={classNames("border-2 border-daonative-gray-100", className)}>{children}</Button>
)

export default Button