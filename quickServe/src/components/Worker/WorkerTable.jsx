import {use} from "react";

import colors from "../ui/color";
import Table from "../ui/table";
import getShiftColor from "../../utils/util";


const WorkerTable = ({ workers }) => {


  
  const workerColumns = [
    { header: "Id", accessor: "id" },
    {
      header: "Worker",
      accessor: (item) => (
        <div className="flex items-center gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: `1px solid ${colors.neutral[200]}` }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: colors.accent[500],
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <span
                className="font-medium text-sm"
                style={{ color: colors.white }}
              >
                {item.name ? item.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          )}
          <div>
            <div
              className="font-medium text-sm"
              style={{ color: colors.neutral[900] }}
            >
              {item.name}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: colors.neutral[500] }}
            >
              {item.email}
            </div>
          </div>
        </div>
      ),
    },

    { header: "Phone", accessor: "phone" },
    {
      header: "Service Type",
      accessor: (item) => {
        let serviceTypes = item.service_type;

        if (typeof serviceTypes === "string") {
          try {
            serviceTypes = JSON.parse(serviceTypes);
          } catch (error) {
            error;
            serviceTypes = [serviceTypes];
          }
        }

        if (Array.isArray(serviceTypes)) {
          return (
            <span
              className="text-xs"
              style={{
                color: colors.neutral[600],
              }}
            >
              {serviceTypes.join(", ")}
            </span>
          );
        }

        // Fallback for single service or invalid data
        return (
          <span
            className="text-xs"
            style={{
              color: colors.neutral[600],
            }}
          >
            {serviceTypes || "Not specified"}
          </span>
        );
      },
    },
    { header: "Expertise", accessor: "expertise_of_service" },
    {
      header: "Rating",
      accessor: (item) => `${item.rating}/5`,
    },
    {
      header: "Status",
      accessor: (item) => {
        const isActive = item.is_active;
        return (
          <span
            className="px-2.5 py-1 rounded-md text-xs font-medium inline-block"
            style={{
              backgroundColor: isActive ? colors.success[50] : colors.error[50],
              color: isActive ? colors.success[500] : colors.error[500],
              border: `1px solid ${
                isActive ? colors.success[200] : colors.error[500]
              }`,
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },

    {
      header: "Shift",
      accessor: (item) => {
        const shiftColors = getShiftColor(item.shift);
        return (
          <span
            style={{
              backgroundColor: shiftColors.background,
              color: shiftColors.text,
              border: `1px solid ${shiftColors.border}`,
            }}
            className="px-2.5 py-1 rounded-full text-xs font-medium inline-block"
          >
            {item.shift || "Not Set"}
          </span>
        );
      },
    },
  ];
  const handleEdit = (worker) => {
    console.log("Edit worker:", worker);
  };

  const handleDelete = () => {
    console.log("data delete");
  };

  const handleView = (worker) => {
    console.log("View worker:", worker);
  };

  return (
    <div className="space-y-5">
      <Table
        title="Workers List"
        data={workers.data}
        columns={workerColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      

        
      
    </div>
  );
};

export default WorkerTable;
