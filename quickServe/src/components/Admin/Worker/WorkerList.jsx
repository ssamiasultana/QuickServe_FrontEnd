import { useWorkers } from "../../../hooks/useWorker";
import WorkerTable from "./WorkerTable";

const WorkerList = () => {
  const { data: workers, isLoading, error } = useWorkers();
  //   const refreshWorkers = () => {
  //     const promise = workerService.getAllWorkers();
  //     setWorkersPromise(promise);
  //   };

  //   useEffect(() => {
  //     refreshWorkers();
  //   }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workers Management</h1>
        <p className="text-gray-600">Manage all registered workers</p>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading workers...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Error loading workers: {error.message}
        </div>
      )}

      {!isLoading && !error && <WorkerTable workers={workers || []} />}
    </div>
  );
};

export default WorkerList;
