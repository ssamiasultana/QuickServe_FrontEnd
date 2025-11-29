import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";
import colors from "../ui/color";
import WorkerSidebar from "../Worker/WorkerSidebar";
export default function WorkerLayout() {
  return (
    <div className="flex h-screen" style={{ background: colors.neutral[50] }}>
      <WorkerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
          }}
        />
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
