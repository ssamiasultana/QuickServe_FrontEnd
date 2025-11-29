import Cookies from "js-cookie";
import API_CONFIG from "../config/apiService";
class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }
  getToken() {
    return Cookies.get("auth_token");
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Request failed");
        error.response = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async signUp(userData) {
    return this.request(API_CONFIG.endpoints.auth.signUp, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request(API_CONFIG.endpoints.auth.login, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
  async getAllUsers() {
    return this.request(API_CONFIG.endpoints.auth.getAll, {
      method: "GET",
    });
  }
}

export default new AuthService();
