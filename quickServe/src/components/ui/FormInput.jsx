export const FormInput = (
  {
    label,
    name,
    type = "text",
    placeholder,
    error,
    icon: Icon,
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
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors ${
            error ? "border-red-500" : ""
          } ${Icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
    </div>
  );
};
