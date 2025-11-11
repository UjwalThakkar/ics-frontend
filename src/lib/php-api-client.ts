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
        payload.error?.message ?? payload.message ?? "Unknown API error";
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
  };
}

/* ------------------------------------------------------------------ */
/* Exported singleton (recommended usage)                              */
/* ------------------------------------------------------------------ */
export const phpAPI = new PHPAPIClient();

export default PHPAPIClient;
