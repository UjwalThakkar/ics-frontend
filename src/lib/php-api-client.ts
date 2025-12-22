// src/lib/php-api-client.ts
/**
 * PHP API client for the Indian Consular Appointment System
 * -------------------------------------------------------
 * - Handles login / token persistence
 * - All endpoints used in the 7-step booking wizard
 * - **NEW** Admin panel endpoints (dashboard, applications, appointments)
 * - Automatic Bearer token injection
 * - Simple error handling (throws on API or network errors)
 * - Type-safe response shapes (mirrors Postman spec)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/* ------------------------------------------------------------------ */
/* Helper Types – match the exact JSON shapes returned by the backend */
/* ------------------------------------------------------------------ */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: { code: string; message: string };
  [key: string]: any;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_no?: string;
  };
}

/* -------------------------- ADMIN TYPES --------------------------- */
import {
  Stats,
  Application,
  Appointment,
  Pagination,
  AdminStatsResponse,
  AdminApplicationsResponse,
  AdminAppointmentsResponse,
  AdminAppointmentDetailsResponse,
  AdminUpdateStatusResponse,
  AdminCreateSlotResponse,
  SlotSettings,
  AdminBulkToggleResponse,
  AdminToggleSlotResponse,
  AdminTimeSlotsResponse,
  AdminToggleServiceResponse,
  ServiceFee,
  AdminCreateServiceResponse,
  AdminServicesResponse,
  Service,
  AdminDeleteServiceDetailsResponse,
  AdminUpdateServiceDetailsResponse,
  AdminCreateServiceDetailsResponse,
  ServiceDetails,
  AdminServiceDetailsResponse,
  Counter,
} from "@/types/admin";

/* ------------------------------------------------------------------ */
/* Main Client Class                                                  */
/* ------------------------------------------------------------------ */
class PHPAPIClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token") ?? null;
    }
  }

  /* --------------------------------------------------------------- */
  /* Private request wrapper                                         */
  /* --------------------------------------------------------------- */
  private async request<T>(
    endpoint: string,
    init: RequestInit = {}
  ): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...init.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    console.debug("→", init.method ?? "GET", url);
    const res = await fetch(url, { ...init, headers, credentials: "omit" });

    const payload: ApiResponse<T> = await res.json();

    if (!res.ok || !payload.success) {
      const errMsg =
        payload.error?.message ??
        payload.message ??
        payload.error ??
        "Unknown API error";
      console.error("API error:", errMsg, payload);
      throw new Error(errMsg);
    }

    return { data: payload as any };
  }

  /* --------------------------------------------------------------- */
  /* Auth                                                            */
  /* --------------------------------------------------------------- */
  async login(
    type: "user" | "admin",
    email: string,
    password: string,
    otp?: string
  ): Promise<LoginResponse> {
    const { data } = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ type, email, password, otp }),
    });

    this.token = data.token;
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  /* --------------------------------------------------------------- */
  /* Services                                                        */
  /* --------------------------------------------------------------- */
  async getServices(): Promise<any> {
    return this.request<any>("/booking/services");
  }

  async getCentersForService(serviceId: string): Promise<any> {
    return this.request<any>(`/booking/centers/${serviceId}`);
  }

  /* --------------------------------------------------------------- */
  /* User details (prefill)                                          */
  /* --------------------------------------------------------------- */
  async getUserDetails(): Promise<any> {
    return this.request<any>("/auth/me");
  }

  /* --------------------------------------------------------------- */
  /* Dates & Slots                                                   */
  /* --------------------------------------------------------------- */
  async getAvailableDates(centerId: string, serviceId: string): Promise<any> {
    return this.request<any>(
      `/booking/available-dates?centerId=${centerId}&serviceId=${serviceId}`
    );
  }

  async getAvailableSlots(
    centerId: string,
    serviceId: string,
    date: string
  ): Promise<any> {
    return this.request<any>(
      `/booking/available-slots?centerId=${centerId}&serviceId=${serviceId}&date=${date}`
    );
  }

  /* --------------------------------------------------------------- */
  /* Booking                                                         */
  /* --------------------------------------------------------------- */
  async bookAppointment(payload: {
    serviceId: string;
    centerId: string;
    date: string;
    slotId: string;
    userDetails: {
      gender: string;
      dateOfBirth: string;
      nationality: string;
      passportNo: string;
      passportExpiry: string;
      phoneNo: string;
    };
  }): Promise<any> {
    return this.request<any>("/booking/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /* ---------------------------------------------------------------- */
  /* -------------------------- ADMIN PANEL -------------------------- */
  /* ---------------------------------------------------------------- */

  /** @namespace admin */
  admin = {
    /** Dashboard stats */
    getDashboardStats: async (): Promise<AdminStatsResponse> => {
      const { data } = await this.request<AdminStatsResponse>(
        "/admin/dashboard-stats"
      );
      return data;
    },

    /** Applications list (with pagination & optional status filter) */
    getApplications: async (params: {
      page?: number;
      limit?: number;
      status?: string;
    }): Promise<AdminApplicationsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminApplicationsResponse>(
        `/admin/applications?${query}`
      );
      return data;
    },

    /** Appointments list (all filters you showed) */
    getAppointments: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      centerId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    }): Promise<AdminAppointmentsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminAppointmentsResponse>(
        `/admin/appointments?${query}`
      );
      return data;
    },

    getAppointmentDetails: async (
      id: number
    ): Promise<AdminAppointmentDetailsResponse> => {
      const { data } = await this.request<AdminAppointmentDetailsResponse>(
        `/admin/appointments/${id}`
      );
      return data;
    },

    /** Update appointment status */
    updateAppointmentStatus: async (
      id: number,
      status: "completed" | "scheduled" | "cancled" | "no-show"
    ): Promise<AdminUpdateStatusResponse> => {
      const { data } = await this.request<AdminUpdateStatusResponse>(
        `/admin/appointments/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
      return data;
    },

    getTimeSlots: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminTimeSlotsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminTimeSlotsResponse>(
        `/admin/time-slots?${query}`
      );
      return data;
    },

    /** Toggle single slot */
    toggleSlot: async (id: number): Promise<AdminToggleSlotResponse> => {
      const { data } = await this.request<AdminToggleSlotResponse>(
        `/admin/time-slots/${id}/toggle`,
        {
          method: "PUT",
        }
      );
      return data;
    },

    /** Bulk toggle */
    bulkToggleSlots: async (
      slot_ids: number[],
      activate: boolean
    ): Promise<AdminBulkToggleResponse> => {
      const { data } = await this.request<AdminBulkToggleResponse>(
        "/admin/time-slots/bulk-toggle",
        {
          method: "POST",
          body: JSON.stringify({ slot_ids, activate }),
        }
      );
      return data;
    },

    /** Create new slot */
    createSlot: async (payload: {
      start_time: string;
      end_time: string;
      is_active?: 1 | 0;
    }): Promise<AdminCreateSlotResponse> => {
      const { data } = await this.request<AdminCreateSlotResponse>(
        "/admin/time-slots",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update global settings */
    updateSlotSettings: async (
      settings: Partial<SlotSettings>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        "/admin/time-slots/settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        }
      );
      return data;
    },

    /** Delete a time slot */
    deleteSlot: async (id: number): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/time-slots/${id}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },

    /** Bulk create slots – now returns skipped count */
    bulkCreateSlots: async (payload: {
      start_time: string;
      end_time: string;
      duration?: number;
    }): Promise<{
      message: string;
      slots: {
        slot_id: number;
        start_time: string;
        end_time: string;
        duration: number;
      }[];
      skipped: number;
    }> => {
      const { data } = await this.request<any>(
        "/admin/time-slots/bulk-create",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      // Normalize response
      return {
        message: data.message,
        slots: data.slots || [],
        skipped: data.skipped || 0,
      };
    },
    getServices: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminServicesResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminServicesResponse>(
        `/admin/services?${query}`
      );
      return data;
    },

    /** Create service */
    createService: async (payload: {
      category: string;
      title: string;
      description?: string;
      processing_time?: string;
      fees: ServiceFee;
      required_documents?: string[];
      eligibility_requirements?: string[];
      is_active?: 1 | 0;
      display_order?: number;
    }): Promise<AdminCreateServiceResponse> => {
      const { data } = await this.request<AdminCreateServiceResponse>(
        "/admin/services",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update service */
    updateService: async (
      id: number,
      payload: Partial<{
        title: string;
        description: string;
        processing_time: string;
        fees: ServiceFee;
        required_documents: string[];
        eligibility_requirements: string[];
        display_order: number;
      }>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/services/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Toggle service */
    toggleService: async (id: number): Promise<AdminToggleServiceResponse> => {
      const { data } = await this.request<AdminToggleServiceResponse>(
        `/admin/services/${id}/toggle`,
        {
          method: "PUT",
        }
      );
      return data;
    },

    /** Delete service */
    deleteService: async (id: number): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/services/${id}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },

    getService: async (id: number): Promise<{ service: Service }> => {
      const { data } = await this.request<{ service: Service }>(
        `/admin/services/${id}`
      );
      return data;
    },

    getActiveCenters: async (): Promise<{
      centers: { center_id: number; name: string; city: string }[];
    }> => {
      const { data } = await this.request<any>(`/centers`);
      return { centers: data.centers || data }; // adjust based on actual response shape
    },
    getCounters: async (): Promise<{ counters: Counter[] }> => {
      const { data } = await this.request<{ counters: Counter[] }>(
        "/admin/counters"
      );
      return data;
    },

    toggleCounter: async (
      id: number
    ): Promise<{ message: string; isActive: boolean }> => {
      const { data } = await this.request<{
        message: string;
        isActive: boolean;
      }>(`/admin/counters/${id}/toggle`, { method: "POST" });
      return data;
    },

    getCounter: async (id: number): Promise<{ counter: Counter }> => {
      const { data } = await this.request<{ counter: Counter }>(
        `/admin/counters/${id}`
      );
      return data;
    },

    updateCounter: async (
      id: number,
      payload: Partial<Counter>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/counters/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Get all service details */
    getServiceDetails: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminServiceDetailsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminServiceDetailsResponse>(
        `/admin/service-details?${query}`
      );
      return data;
    },

    /** Get single service details */
    getServiceDetail: async (
      serviceId: number
    ): Promise<{ details: ServiceDetails }> => {
      const { data } = await this.request<{ details: ServiceDetails }>(
        `/service-details/${serviceId}`
      );
      console.log("details fetched from api client", data);
      return data;
    },

    /** Create service details */
    createServiceDetails: async (payload: {
      serviceId: number;
      overview: string;
      visaFees: string;
      documentsRequired: string;
      photoSpecifications: string;
      processingTime: string;
      downloadsForm: string;
    }): Promise<AdminCreateServiceDetailsResponse> => {
      const { data } = await this.request<AdminCreateServiceDetailsResponse>(
        "/admin/service-details",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update service details */
    updateServiceDetails: async (
      serviceId: number,
      payload: Partial<{
        overview: string;
        visaFees: string;
        documentsRequired: string;
        photoSpecifications: string;
        processingTime: string;
        downloadsForm: string;
      }>
    ): Promise<AdminUpdateServiceDetailsResponse> => {
      const { data } = await this.request<AdminUpdateServiceDetailsResponse>(
        `/admin/service-details/${serviceId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Delete service details */
    deleteServiceDetails: async (
      serviceId: number
    ): Promise<AdminDeleteServiceDetailsResponse> => {
      const { data } = await this.request<AdminDeleteServiceDetailsResponse>(
        `/admin/service-details/${serviceId}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },
  };
}

/* ------------------------------------------------------------------ */
/* Exported singleton (recommended usage)                              */
/* ------------------------------------------------------------------ */
export const phpAPI = new PHPAPIClient();

export default PHPAPIClient;
