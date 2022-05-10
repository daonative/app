import { classNames } from "../lib/utils"

export const Input = ({ name, register, required, placeholder, className, type = "text" }) => {
  return <input
    type={type}
    placeholder={placeholder}
    className={classNames("w-full rounded-md bg-daonative-component-bg border-transparent text-daonative-text", className)}
    {...register(name, { required })}
  />


}
export const Label = ({ children, className }) => {
  return <label
    className={classNames("block text-sm font-medium pb-2", className)}
  >
    {children}
  </label>

}
export const TextField = ({ label, name, register, required, placeholder, type }) => (
  <>
    <Label>{label}</Label>
    <Input name={name} register={register} required={required} placeholder={placeholder} type={type} />
  </>
);

export const Select = ({ label, name, register, children }) => (
  <>
    <Label>
      {label}
    </Label>
    <select
      {...register(name)}
      className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-white"
    >
      {children}
    </select>
  </>
);
