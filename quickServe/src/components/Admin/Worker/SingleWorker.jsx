import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import workerService from "../../../services/workerService";
import { calculateAverageRating } from "../../../utils/util";

function SingleWorker() {
  const params = useParams();
  const id = params.id;

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await workerService.getSingleWorker(id);
        setWorker(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load worker details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorker();
    } else {
      setError("No worker ID provided");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (worker && worker.expertise_of_service) {
      const avgRating = calculateAverageRating(worker.expertise_of_service);
      setAverageRating(avgRating);
    }
  }, [worker]);

  // Parse service data
  const getServiceData = () => {
    if (!worker) return { serviceTypes: [], serviceRatings: {} };

    let serviceTypes = [];
    let serviceRatings = {};

    if (typeof worker.service_type === "string") {
      try {
        serviceTypes = JSON.parse(worker.service_type);
      } catch {
        serviceTypes = worker.service_type ? [worker.service_type] : [];
      }
    } else if (Array.isArray(worker.service_type)) {
      serviceTypes = worker.service_type;
    }

    if (typeof worker.expertise_of_service === "string") {
      try {
        serviceRatings = JSON.parse(worker.expertise_of_service);
      } catch {
        serviceRatings = {};
      }
    } else if (typeof worker.expertise_of_service === "object") {
      serviceRatings = worker.expertise_of_service || {};
    }

    return { serviceTypes, serviceRatings };
  };

  const { serviceTypes, serviceRatings } = getServiceData();

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading worker details...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !worker) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || "Worker not found"}</p>
          <Link
            to="/manage"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/manage"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Workers
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {worker.image ? (
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold text-blue-600">
                  {worker.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{worker.name}</p>
              <p className="text-sm text-gray-500">Name</p>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-900">{worker.email}</p>
            <p className="text-sm text-gray-500">Email</p>
          </div>

          <div>
            <p className="font-medium text-gray-900">{worker.phone}</p>
            <p className="text-sm text-gray-500">Phone</p>
          </div>

          <div>
            <p className="font-medium text-gray-900">{worker.age} years</p>
            <p className="text-sm text-gray-500">Age</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              worker.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {worker.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Shift</h3>
          <p className="text-gray-900">{worker.shift || "Not specified"}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Average Rating</h3>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-semibold text-gray-900">
              {averageRating}/5
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Services & Ratings
        </h2>
        <div className="space-y-3">
          {serviceTypes.length > 0 ? (
            serviceTypes.map((service) => (
              <div
                key={service}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{service}</span>
                {serviceRatings[service] ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < serviceRatings[service]
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      ({serviceRatings[service]}/5)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No rating</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No services assigned
            </p>
          )}
        </div>
      </div>

      {worker.feedback && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Feedback
          </h2>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {worker.feedback}
          </p>
        </div>
      )}
    </div>
  );
}

export default SingleWorker;
