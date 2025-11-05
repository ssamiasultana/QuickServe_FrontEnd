import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import AddWorker from "./components/Worker/AddWorker.jsx";

const routes = createBrowserRouter([
    {
        path: "/",
       Component: App,
       children:[
        {
            path: "/worker/add",
            Component: AddWorker
        }
       ]
    }

    
])
export default routes;