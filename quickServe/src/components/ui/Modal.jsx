import { X } from "lucide-react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  icon: Icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  size = "md",
  showCloseButton = true,
  footer,
  footerAlignment = "right",
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full p-6 animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`${iconBgColor} p-2 rounded-full`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
            )}
            {title && (
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div>{children}</div>

        {footer && (
          <div
            className={`flex gap-3 mt-6 ${alignmentClasses[footerAlignment]}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
