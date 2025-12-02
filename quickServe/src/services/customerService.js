import API_CONFIG from "../config/apiService";
class CustomerService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
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
  }

  async getAllCustomer() {
    return this.request(API_CONFIG.endpoints.customers.getAll, {
      method: "GET",
    });
  }
}

export default new CustomerService();
