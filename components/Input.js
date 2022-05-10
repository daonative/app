import { classNames } from "../lib/utils"

export const FileInput = ({ name, register, required = false, validate, className }) => {

  return <input {...register(name, { required: required, validate })} type="file" className={classNames("block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-daonative-component-bg file:text-daonative-white hover:file:brightness-125 max-w-max", className)} />
}

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
