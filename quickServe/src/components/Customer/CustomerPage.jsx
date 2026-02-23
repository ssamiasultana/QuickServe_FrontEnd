import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchWorkers, useWorkers } from "../../hooks/useWorker";
import SearchBar from "../ui/SearchBar";
import WorkersCard from "./WorkerCard";

function CustomerPage() {
  const [searchParams, setSearchParams] = useState("");

  const debouncedSearchParams = useDebounce(searchParams, 500);

  const hasSearchTerm = debouncedSearchParams.trim().length > 0;

  const searchQuery = useSearchWorkers(debouncedSearchParams, {
    enabled: hasSearchTerm,
  });

  const allWorkersQuery = useWorkers({
    enabled: !hasSearchTerm,
  });

  const activeQuery = hasSearchTerm ? searchQuery : allWorkersQuery;
  const { data, isLoading, isError, error, isFetching } = activeQuery;

  const handleSearchChange = (value) => {
    setSearchParams(value);
  };

  const showLoading = isLoading && !data;

  const showSearching = isFetching && hasSearchTerm && data;

  if (showLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading workers...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-600">
        <p className="font-semibold">Failed to load workers.</p>
        <p className="text-sm text-red-500">
          {error?.message || "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Find Workers</h1>
          <SearchBar
            placeholder="Search by name or service type"
            value={searchParams}
            onChange={handleSearchChange}
          />
        </div>

        {showSearching && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Searching...</span>
          </div>
        )}

        <div>
          <WorkersCard
            workerData={Array.isArray(data) ? data : data?.data || []}
            isSearching={hasSearchTerm}
            searchTerm={debouncedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerPage;
