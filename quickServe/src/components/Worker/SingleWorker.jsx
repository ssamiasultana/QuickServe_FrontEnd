import { useEffect, useState } from "react";
import { useParams } from "react-router";
import workerService from "../../services/workerService";

function SingleWorker() {
  const params = useParams();
  const id = params.id;
  console.log(params);

  const [worker, setWorker] = useState(null);
  useEffect(() => {
    const fetchWorker = async () => {
      console.log("🔍 [DEBUG] fetchWorker function called");
      try {
        const response = await workerService.getSingleWorker(params.id);
        console.log("✅ [DEBUG] Worker data received:", response.data);
        setWorker(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchWorker();
    }
  }, [id]);
  return <div>{worker?.name}</div>;
}

export default SingleWorker;
