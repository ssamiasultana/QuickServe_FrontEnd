import { CirclePlus } from "lucide-react";
import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import WorkerService from "../../services/workerService";
import { createServiceAction } from "../../utils/workerAction";
import { FormInput } from "../ui/FormInput";
import ServiceList from "./ServiceList";

function Service() {
  const [servicePromise, setServicePromise] = useState(
    WorkerService.getServices()
  );

  const [state, formAction, isPending] = useActionState(
    createServiceAction,
    null
  );
  const lastSuccessRef = useRef(false);
  const refreshServices = () => {
    setServicePromise(WorkerService.getServices());
  };

  useEffect(() => {
    // Only refresh if this is a NEW success (not a re-render of the same success state)
    if (state?.success && !lastSuccessRef.current) {
      lastSuccessRef.current = true;
      refreshServices();
      setShowForm(false); // Close form on success
    } else if (!state?.success) {
      lastSuccessRef.current = false;
    }
  }, [state?.success]);

  const [showForm, setShowForm] = useState(false);
  const handleFormToggle = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="mt-0">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-row items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 ">Services</p>
              <button
                onClick={handleFormToggle}
                disabled={isPending}
                className="flex items-center gap-2 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CirclePlus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
            <form action={formAction}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <FormInput
                    name="name"
                    placeholder="Enter service name (e.g., Plumbing, Cleaning)"
                    required
                    error={state?.errors?.name}
                    disabled={isPending}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium min-w-[120px]"
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleFormToggle}
                    disabled={isPending}
                    className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium min-w-[100px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div>
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading Services...</span>
              </div>
            }
          >
            <ServiceList
              servicePromise={servicePromise}
              onRefresh={refreshServices}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Service;
