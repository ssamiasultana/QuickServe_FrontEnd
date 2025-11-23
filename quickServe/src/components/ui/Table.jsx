import { Edit2, Eye, Trash2 } from "lucide-react";
import Card from "./Card";
import colors from "./color";

const Table = ({
  data = [],
  columns = [],
  actions = true,
  onView,
  onEdit,
  onDelete,
  className = "",
  title,
}) => {
  const getValue = (item, accessor) => {
    if (typeof accessor === "function") {
      return accessor(item);
    }
    return item[accessor];
  };

  return (
    <Card
      formCard={true}
      title={title}
      className={`overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: colors.neutral[200],
                backgroundColor: colors.white,
              }}
            >
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider"
                  style={{
                    color: colors.neutral[600],
                    fontWeight: 500,
                  }}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th
                  className="px-4 py-3 text-right text-xs font-medium tracking-wider"
                  style={{
                    color: colors.neutral[600],
                    fontWeight: 500,
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr
                  key={item.id || rowIndex}
                  className="border-b transition-colors duration-150"
                  style={{
                    borderColor: colors.neutral[200],
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm"
                      style={{ color: colors.neutral[700] }}
                    >
                      {getValue(item, column.accessor)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1.5 rounded-md transition-all duration-200 hover:bg-neutral-100"
                            style={{
                              color: colors.accent[500],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = colors.accent[600];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = colors.accent[500];
                            }}
                            title="View"
                          >
                            <Eye size={16} strokeWidth={2} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-md transition-all duration-200 hover:bg-neutral-100"
                            style={{
                              color: colors.success[500],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = colors.success[500];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = colors.success[500];
                            }}
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-md transition-all duration-200 hover:bg-red-50"
                            style={{
                              color: colors.error[500],
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = colors.error[500];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = colors.error[500];
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-sm"
                  style={{ color: colors.neutral[400] }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Table;
