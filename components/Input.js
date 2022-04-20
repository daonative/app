export const Input = ({ name, register, required, placeholder }) => {
  return <input
    type="text"
    placeholder={placeholder}
    className="w-full rounded-md bg-daonative-component-bg border-transparent text-daonative-text"
    {...register(name, { required })}
  />


}
export const TextField = ({ label, name, register, required, placeholder }) => (
  <>
    <label
      className="block text-sm font-medium pb-2"
    >
      {label}
    </label>
    <Input name={name} register={register} required={required} placeholder={placeholder} />
  </>
);
