const API_BASE = "/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("Getting auth headers, token exists:", !!token);
  if (token) {
    console.log("Token preview:", token.substring(0, 20) + "...");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new ApiError(response.status, errorData.message || "Request failed");
  }

  try {
    return await response.json();
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new ApiError(500, "Invalid response format");
  }
};

export const api = {
  // Health check
  async ping() {
    const response = await fetch(`${API_BASE}/ping`);
    return handleResponse(response);
  },

  // Auth
  async login(mobileNumber: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber, password }),
    });
    return handleResponse(response);
  },

  async register(fullName: string, mobileNumber: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, mobileNumber, password }),
    });
    return handleResponse(response);
  },

  // Dashboard
  async getDashboardStats() {
    try {
      console.log("Making request to:", `${API_BASE}/dashboard/stats`);
      console.log("Auth headers:", getAuthHeaders());

      const response = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: getAuthHeaders(),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      return handleResponse(response);
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createUser(userData: any) {
    try {
      console.log("Creating user with data:", userData);
      const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
      console.log("Request headers:", headers);

      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(userData),
      });

      console.log("Create user response status:", response.status);
      return handleResponse(response);
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async deleteUser(id: string) {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Coordinates
  async getCoordinates() {
    const response = await fetch(`${API_BASE}/coordinates`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createCoordinate(coordinateData: any) {
    const response = await fetch(`${API_BASE}/coordinates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(coordinateData),
    });
    return handleResponse(response);
  },

  async updateCoordinate(id: string, coordinateData: any) {
    const response = await fetch(`${API_BASE}/coordinates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(coordinateData),
    });
    return handleResponse(response);
  },

  async deleteCoordinate(id: string) {
    const response = await fetch(`${API_BASE}/coordinates/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Sliders
  async getSliders() {
    const response = await fetch(`${API_BASE}/admin/sliders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createSlider(sliderData: any) {
    const response = await fetch(`${API_BASE}/sliders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(sliderData),
    });
    return handleResponse(response);
  },

  async updateSlider(id: string, sliderData: any) {
    const response = await fetch(`${API_BASE}/sliders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(sliderData),
    });
    return handleResponse(response);
  },

  async deleteSlider(id: string) {
    const response = await fetch(`${API_BASE}/sliders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Feedback
  async getFeedbacks() {
    const response = await fetch(`${API_BASE}/feedbacks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async deleteFeedback(id: string) {
    const response = await fetch(`${API_BASE}/feedbacks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateSettings(settingsData: any) {
    const response = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(settingsData),
    });
    return handleResponse(response);
  },

  // Content Management
  async getContents() {
    const response = await fetch(`${API_BASE}/admin/contents`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createContent(contentData: any) {
    const response = await fetch(`${API_BASE}/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(contentData),
    });
    return handleResponse(response);
  },

  async updateContent(id: string, contentData: any) {
    const response = await fetch(`${API_BASE}/contents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(contentData),
    });
    return handleResponse(response);
  },

  async deleteContent(id: string) {
    const response = await fetch(`${API_BASE}/contents/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // File Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};
