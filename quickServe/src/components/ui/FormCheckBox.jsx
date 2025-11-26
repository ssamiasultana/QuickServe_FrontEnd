export const FormCheckboxGroup = ({
  label,
  name,
  options = [],
  error,
  required = false,
  className = "",
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm mb-3 text-gray-600 font-semibold">
          {label} {required && "*"}
        </label>
      )}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-white"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm mt-2 text-red-500">{error}</p>}
    </div>
  );
};
