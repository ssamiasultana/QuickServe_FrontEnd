import { Suspense } from "react";
import workerService from "../../services/workerService";
import SingleWorkerCard from "./SingleworkerCard";

function WorkersCard() {
  const workersPromise = workerService.getAllWorkers();

  return (
    <div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading workers...</span>
          </div>
        }
      >
        <SingleWorkerCard workerPromise={workersPromise} />
      </Suspense>
    </div>
  );
}

export default WorkersCard;
