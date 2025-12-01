const Card = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-gray-600",
  iconBgColor = "bg-gray-50",
  trend,
  trendValue,
  children,
  className = "",
  bgColor = "bg-white",
  borderColor = "border-neutral-200",
  formCard = false,
}) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600 bg-green-50";
    if (trend === "down") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  if (formCard) {
    return (
      <div
        className={`${bgColor} rounded-xl p-6 shadow-sm border ${borderColor} ${className}`}
      >
        {title && (
          <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-neutral-100">
            {title}
          </h3>
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} rounded-xl p-4 shadow-xs border ${borderColor} hover:shadow-sm transition-all duration-200 group ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
          {title}
        </h3>
        {Icon && (
          <div
            className={`p-2 rounded-lg ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between mb-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}
          >
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default Card;
