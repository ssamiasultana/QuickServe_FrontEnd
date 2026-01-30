import API_CONFIG from "../config/apiService";
import Cookies from 'js-cookie';

class ModeratorService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  getToken() {
    return Cookies.get('auth_token');
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
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getAllModerators() {
    return this.request(API_CONFIG.endpoints.moderators.getAll, {
      method: "GET",
    });
  }

  async getPaginatedModerators(page = 1, perPage = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    return this.request(`${API_CONFIG.endpoints.moderators.getPaginated}?${params}`, {
      method: "GET",
    });
  }

  async getSingleModerator(id) {
    return this.request(API_CONFIG.endpoints.moderators.getSingleModerator(id), {
      method: "GET",
    });
  }

  async updateModerator(id, moderatorData) {
    return this.request(API_CONFIG.endpoints.moderators.updateModerator(id), {
      method: "PATCH",
      body: JSON.stringify(moderatorData),
    });
  }

  async deleteModerator(id) {
    return this.request(API_CONFIG.endpoints.moderators.deleteModerator(id), {
      method: "DELETE",
    });
  }
}

export default new ModeratorService();
