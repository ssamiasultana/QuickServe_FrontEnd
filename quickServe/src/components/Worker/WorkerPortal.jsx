import { useEffect, useState } from "react";
import workerService from "../../services/workerService";

export default function WorkerPortal() {
  const [data, setData] = useState();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await workerService.checkWorkerProfile();

        setData(response);
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };
    checkProfile();
  }, []);
  return (
    <div>{!data?.isComplete ? <h1>{data?.message}</h1> : <h2>Jobs</h2>}</div>
  );
}
