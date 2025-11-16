import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import AddWorker from "./components/Worker/AddWorker.jsx";
import WorkerTable from "./components/Worker/workertable.jsx";

const routes = createBrowserRouter([
    {
        path: "/",
       Component: App,
       children:[
        {
            path: "/add",
            Component: AddWorker
        },
         { path: '/manage', Component: WorkerTable },
       ]
    }

    
])
export default routes;