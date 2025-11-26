import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";
import CustomerNavbar from "../Customer/CustomerNavbar";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="flex-1 p-6 overflow-auto">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default CustomerLayout;
