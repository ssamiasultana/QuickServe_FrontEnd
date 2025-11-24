export const FormSelect = (
  {
    label,
    name,
    options = [],
    error,
    required = false,
    className = "",
    placeholder = "Select an option",
    ...props
  },
  ref
) => {
  return (
    <div>
      {label && (
        <label className="block text-sm mb-2 text-gray-600 font-semibold">
          {label} {required && "*"}
        </label>
      )}
      <select
        ref={ref}
        name={name}
        className={`w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-white ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
    </div>
  );
};
