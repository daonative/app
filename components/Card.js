export const Card = ({ children }) => {
  return (
    <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between drop-shadow-daonative hover:cursor-pointer hover:opacity-75">
      {children}
    </div>
  );
};
