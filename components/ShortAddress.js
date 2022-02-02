const ShortAddress = ({ length = 6, children }) => (
  typeof children === "string" ? (
    `${children.substring(0, (length / 2) + 2)}...${children.substring(children.length - length / 2)}`
  ) : ""
);

export default ShortAddress