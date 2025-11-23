import { Suspense } from "react";
import WorkerService from "../../services/workerService";
import WorkerTable from "./WorkerTable";

const WorkerList = () => {
  const workersPromise = WorkerService.getAllWorkers();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workers Management</h1>
        <p className="text-gray-600">Manage all registered workers</p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading workers...</span>
          </div>
        }
      >
        <WorkerTable workerPromise={workersPromise} />
      </Suspense>
    </div>
  );
};

export default WorkerList;
