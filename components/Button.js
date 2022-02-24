const Button = ({ children, onClick, type = "button" }) => (
  <button
    type={type}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100"
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button