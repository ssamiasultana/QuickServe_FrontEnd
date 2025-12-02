import { Suspense } from "react";
import customerService from "../../../services/customerService";
import CustomerTable from "./CustomerTable";

const CustomerList = () => {
  const customerPromise = customerService.getAllCustomer();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading Customers...</span>
          </div>
        }
      >
        <CustomerTable customerPromise={customerPromise} />
      </Suspense>
    </div>
  );
};

export default CustomerList;
