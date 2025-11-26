import { AlertTriangle } from "lucide-react";
import { use, useEffect, useRef, useState, useTransition } from "react";
import { useNavigate } from "react-router";
import workerService from "../../services/workerService";
import { getShiftColor } from "../../utils/util";
import colors from "../ui/color";
import Modal from "../ui/Modal";
import Table from "../ui/table";
import UpdateModal from "./UpdateModal";

const WorkerTable = ({ workerPromise, onWorkerUpdate }) => {
  const workerData = use(workerPromise);

  const workers = Array.isArray(workerData?.data)
    ? workerData.data
    : Array.isArray(workerData)
    ? workerData
    : [];
  const navigate = useNavigate();
  const ITEMS_PER_PAGE_OPTIONS = [10, 20];
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [editModal, setEditModal] = useState({ open: false, worker: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, worker: null });
  const [isPending, startTransition] = useTransition();
  const lastDeleteSuccessRef = useRef(false);
  useEffect(() => {
    setCurrentPage(1);
  }, [workers.length]);

  const totalPages = Math.max(1, Math.ceil(workers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkers = workers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

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
        let serviceRatings = item.expertise_of_service;

        if (typeof serviceTypes === "string") {
          try {
            serviceTypes = JSON.parse(serviceTypes);
          } catch (error) {
            console.error("Error parsing service_type:", error);
            serviceTypes = [serviceTypes];
          }
        }

        if (typeof serviceRatings === "string") {
          try {
            serviceRatings = JSON.parse(serviceRatings);
          } catch (error) {
            console.error("Error parsing service_ratings:", error);
            serviceRatings = {};
          }
        }

        if (!serviceRatings || Object.keys(serviceRatings).length === 0) {
          if (Array.isArray(serviceTypes)) {
            return (
              <span
                className="text-xl"
                style={{
                  color: colors.neutral[600],
                }}
              >
                {serviceTypes.join(", ")}
              </span>
            );
          }
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
        }

        if (Array.isArray(serviceTypes)) {
          const formattedServices = serviceTypes.map((service) => {
            const rating = serviceRatings[service];
            return rating ? `${service}(${rating})` : service;
          });

          return (
            <span
              className="text-xs"
              style={{
                color: colors.neutral[600],
              }}
            >
              {formattedServices.join(", ")}
            </span>
          );
        }

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
    setEditModal({ open: true, worker });
  };
  const handleDelete = (worker) => {
    setDeleteModal({ open: true, worker });

    lastDeleteSuccessRef.current = false;
  };

  const confirmDelete = () => {
    if (!deleteModal.worker) return;
    setDeleteModal({ open: false });

    startTransition(async () => {
      try {
        await workerService.deleteWorker(deleteModal.worker.id);

        if (!lastDeleteSuccessRef.current) {
          lastDeleteSuccessRef.current = true;
          onWorkerUpdate();
        }
      } catch (error) {
        console.error("Failed to delete worker:", error);
        alert("Delete failed. Please try again.");
        lastDeleteSuccessRef.current = false;
      }
    });
  };
  const handleView = (worker) => {
    navigate(`/workers/${worker.id}`);
  };

  return (
    <div className="space-y-5">
      <Table
        title="Workers List"
        data={paginatedWorkers}
        columns={workerColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <UpdateModal
        editModal={editModal}
        setEditModal={setEditModal}
        onWorkerUpdate={onWorkerUpdate}
      />
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, worker: null })}
        title="Delete Worker"
        icon={AlertTriangle}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        size="md"
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ open: false, worker: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Are you sure you want to delete worker{" "}
            <strong className="text-gray-900">
              {deleteModal.worker?.name}
            </strong>
            ?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
      </Modal>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
        <div className="flex items-center gap-3 text-sm">
          <span style={{ color: colors.neutral[600] }}>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              border: `1px solid ${colors.neutral[300]}`,
              color: colors.neutral[700],
              backgroundColor: colors.white,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent[500];
              e.target.style.boxShadow = `0 0 0 2px ${colors.accent[50]}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.neutral[300];
              e.target.style.boxShadow = "none";
            }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span style={{ color: colors.neutral[500] }} className="ml-2">
            Showing{" "}
            <span style={{ color: colors.neutral[700], fontWeight: 500 }}>
              {workers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>
            {" - "}
            <span style={{ color: colors.neutral[700], fontWeight: 500 }}>
              {Math.min(currentPage * itemsPerPage, workers.length)}
            </span>
            {" of "}
            <span style={{ color: colors.neutral[700], fontWeight: 500 }}>
              {workers.length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-1.5 text-sm rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              border: `1px solid ${colors.neutral[300]}`,
              color: colors.neutral[700],
              backgroundColor: colors.white,
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = colors.neutral[50];
                e.currentTarget.style.borderColor = colors.neutral[400];
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.white;
              e.currentTarget.style.borderColor = colors.neutral[300];
            }}
          >
            Previous
          </button>
          <span className="text-sm px-3" style={{ color: colors.neutral[600] }}>
            Page <span style={{ fontWeight: 500 }}>{currentPage}</span> of{" "}
            <span style={{ fontWeight: 500 }}>{totalPages}</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-1.5 text-sm rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              border: `1px solid ${colors.neutral[300]}`,
              color: colors.neutral[700],
              backgroundColor: colors.white,
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = colors.neutral[50];
                e.currentTarget.style.borderColor = colors.neutral[400];
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.white;
              e.currentTarget.style.borderColor = colors.neutral[300];
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerTable;
