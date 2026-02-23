import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchWorkers, useWorkers } from "../../hooks/useWorker";
import SearchBar from "../ui/SearchBar";
import WorkersCard from "./WorkerCard";
import { FormInput } from "../ui/FormInput";
import { MapPin, Calendar } from "lucide-react";

function CustomerPage() {
  const [searchParams, setSearchParams] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const debouncedSearchParams = useDebounce(searchParams, 500);
  const debouncedLocation = useDebounce(locationFilter, 500);

  const hasFilters = debouncedSearchParams.trim().length > 0 || 
                     debouncedLocation.trim().length > 0 || 
                     dateFilter.trim().length > 0;

  const searchQuery = useSearchWorkers(debouncedSearchParams, {
    enabled: hasFilters,
    location: debouncedLocation,
    date: dateFilter,
  });

  const allWorkersQuery = useWorkers({
    enabled: !hasFilters,
  });

  const activeQuery = hasFilters ? searchQuery : allWorkersQuery;
  const { data, isLoading, isError, error, isFetching } = activeQuery;

  const handleSearchChange = (value) => {
    setSearchParams(value);
  };
  
  const handleLocationChange = (value) => {
    setLocationFilter(value);
  };
  
  const handleDateChange = (value) => {
    setDateFilter(value);
  };
  
  const clearFilters = () => {
    setSearchParams("");
    setLocationFilter("");
    setDateFilter("");
  };

  const showLoading = isLoading && !data;

  const showSearching = isFetching && hasFilters && data;

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
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SearchBar
                placeholder="Search by name or service type"
                value={searchParams}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <FormInput
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <FormInput
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          {(hasFilters) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}
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
            isSearching={hasFilters}
            searchTerm={debouncedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerPage;
