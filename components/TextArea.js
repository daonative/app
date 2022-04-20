export const TextArea = ({ label, name, register, required, rows = 8 }) => (
  <div >
    <label
      className="block text-sm font-medium pb-2">
      {label}
    </label>
    <textarea rows={rows} {...register(name, { required })}
      className="p-4 shadow-sm block w-full rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
  </div>
);
