// src/lib/php-api-client.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ApiResponse<T> {
  success: boolean;
  token?: string;
  uesr: T;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

class PHPAPIClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // ✨ ADD: Full URL for debugging
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log("🌐 API Request:", {
      url: fullUrl,
      method: options.method || "GET",
      hasToken: !!this.token,
    });

    try {
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        // ✨ ADD: Mode and credentials for CORS
        mode: "cors",
        credentials: "omit", // Change to 'include' if you need cookies
      });

      console.log("✅ API Response Status:", response.status);

      const data = await response.json();
      console.log("📦 API Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error?.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("❌ API Error:", error);

      // ✨ ADD: More detailed error logging
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("🚫 Network Error - Possible causes:");
        console.error("1. PHP backend is not running");
        console.error("2. Wrong API URL:", API_BASE_URL);
        console.error("3. CORS not configured in PHP backend");
        console.error("4. Firewall blocking the request");
      }

      throw error;
    }
  }

  // Authentication
  async login(type: string, username: string, password: string) {
    console.log("🔐 Attempting login...");
    const response = await this.request<{
      token: string;
      user: any;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ type, username, password }),
    });

    if (response.success) {
      this.token = response.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      console.log("✅ Login successful");
    }

    return response;
  }

  async register(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    password: string
  ) {
    console.log("registering new user...");
    const response = await this.request<{
      user: any;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        phone,
        password,
      }),
    });

    if (response.success) {
      console.log("✅ Registration successful");
    }
    return response;
  }

  async logout() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  }

  // Services
  async getServices() {
    return this.request<any[]>("/services");
  }

  async getService(serviceId: string) {
    return this.request<any>(`/services/${serviceId}`);
  }

  // Applications
  async submitApplication(data: any) {
    console.log("📝 Submitting application:", data);
    return this.request<{
      application_id: string;
      status: string;
      submitted_at: string;
      tracking_url: string;
    }>("/applications/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async trackApplication(applicationId: string) {
    return this.request<any>(`/applications/track/${applicationId}`);
  }

  async getUserApplications(userId: string) {
    return this.request<any[]>(`/applications/user/${userId}`);
  }

  // Appointments
  async bookAppointment(data: any) {
    return this.request<{
      appointment_id: string;
      appointment_date: string;
      status: string;
    }>("/appointments/book", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAvailableSlots(date: string, service: string) {
    return this.request<any>(
      `/appointments/slots?date=${date}&service=${service}`
    );
  }

  // File Uploads
  async uploadDocument(
    file: File,
    applicationId: string,
    documentType: string
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("application_id", applicationId);
    formData.append("document_type", documentType);

    console.log("📤 Uploading document...");
    const fullUrl = `${API_BASE_URL}/upload/secure`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
      mode: "cors",
      credentials: "omit",
    });

    return response.json();
  }

  // Admin APIs
  admin = {
    getDashboardStats: () => this.request<any>("/admin/dashboard/stats"),

    getApplications: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      service?: string;
    }) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.request<any>(`/admin/applications?${queryString}`);
    },

    updateApplicationStatus: (
      applicationId: string,
      status: string,
      notes?: string
    ) =>
      this.request<any>(`/admin/applications/${applicationId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      }),

    bulkUpdateApplications: (
      applicationIds: string[],
      action: string,
      notes?: string
    ) =>
      this.request<any>("/admin/applications/bulk-update", {
        method: "POST",
        body: JSON.stringify({
          application_ids: applicationIds,
          action,
          notes,
        }),
      }),

    sendNotification: (data: any) =>
      this.request<any>("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getUsers: (params?: { role?: string; page?: number }) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.request<any>(`/admin/users?${queryString}`);
    },

    createUser: (userData: any) =>
      this.request<any>("/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    getAnalytics: (params: {
      period: string;
      type: string;
      service?: string;
    }) => {
      const queryString = new URLSearchParams(params as any).toString();
      return this.request<any>(`/admin/analytics?${queryString}`);
    },
  };
}

// Export singleton instance
export const phpAPI = new PHPAPIClient();

// Export class for creating new instances
export default PHPAPIClient;
