import API_CONFIG from "../config/apiService";

const request = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await (await fetch(url, config)).json();

    if (response.errors && Object.keys(response.errors).length > 0) {
      throw new Error(` ${response.message}`);
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

 export  const createWorker = async (workerData) => {
  const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.workers.create}`;

  const config = {
    method: "POST",
    body: JSON.stringify(workerData),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(` ${data.message}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

 export const getAllWorkers = async () => {
  return request(API_CONFIG.endpoints.workers.getAll, {
    method: "GET",
  });
};

