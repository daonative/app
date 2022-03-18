export const Card = ({ children }) => {
  return (
    <div className="px-4 py-4 sm:px-6 bg-daonative-component-bg rounded-lg drop-shadow-daonative hover:cursor-pointer opacity-[85%] hover:opacity-100">
      {children}
    </div>
  );
};
