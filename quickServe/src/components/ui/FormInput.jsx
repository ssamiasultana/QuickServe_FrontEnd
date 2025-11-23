export const FormInput = (
  {
    label,
    name,
    type = "text",
    placeholder,
    error,
    required = false,
    className = "",
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
      <input
        ref={ref}
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
    </div>
  );
};
