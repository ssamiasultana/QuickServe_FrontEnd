import API_CONFIG from "../config/apiService";

class PasswordService {
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

  async forgotPassword(email) {
    return this.request("/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyToken(token) {
    return this.request(`/password/reset/${token}`, {
      method: "GET",
    });
  }

  async resetPassword(token, password, password_confirmation) {
    return this.request("/password/reset", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        password_confirmation,
      }),
    });
  }
}

export default new PasswordService();
