import SearchBar from "../ui/SearchBar";
import WorkersCard from "./WorkerCard";

function CustomerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Find Workers</h1>
          <SearchBar placeholder="Search by service type or location" />
        </div>

        <div className="flex gap-4 flex-wrap"></div>

        <div>
          <WorkersCard />
        </div>
      </div>
    </div>
  );
}

export default CustomerPage;
