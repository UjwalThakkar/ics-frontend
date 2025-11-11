// src/types/admin.ts
export interface Stats {
  applications: {
    total: number;
    submitted: number;
    this_month: number;
    today: number;
  };
  appointments: {
    total: number;
    today: number;
    upcoming_week: number;
    top_services: any[];
  };
  notifications: {
    total: number;
    failed: number;
    email: number;
  };
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
}

export interface Application {
  id: number;
  application_id: string;
  user_id: string | null;
  service_id: string;
  service_title: string;
  applicant_info: string; // JSON string
  status: string;
  priority: string;
  submitted_at: string;
  last_updated: string;
}

export interface Appointment {
  appointment_id: number;
  booked_by: number;
  booked_for_service: number;
  at_counter: number;
  appointment_date: string;
  slot: number;
  appointment_status: string;
  created_at: string;
  updated_at: string;
  counter_name: string;
  center_id: number;
  service_id: number;
  first_name: string;
  last_name: string;
  passport_no: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface AdminStatsResponse {
  stats: Stats;
}

export interface AdminApplicationsResponse {
  applications: Application[];
  pagination: Pagination;
}

export interface AdminAppointmentsResponse {
  appointments: Appointment[];
  pagination: Pagination;
}

// src/types/admin.ts (append)
export interface AppointmentDetails {
  appointment_id: number;
  booked_by: number;
  booked_for_service: number;
  at_counter: number;
  appointment_date: string;
  slot: number;
  appointment_status: string;
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
  duration: number;
  service_name: string;
  service_category: string;
  processing_time: string;
  counter_name: string;
  center_id: number;
  center_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string | null;
  passport_no: string;
  date_of_birth: string;
  nationality: string;
}

export interface AdminAppointmentDetailsResponse {
  appointment: AppointmentDetails;
}

export interface AdminUpdateStatusResponse {
  message: string;
}

// src/types/admin.ts (append)
export interface TimeSlot {
  slot_id: number;
  start_time: string;
  end_time: string;
  duration: number;
  is_active: 1 | 0;
  created_at: string;
  updated_at: string;
}

export interface SlotSettings {
  slot_duration_minutes: number;
  max_appointments_per_slot: number;
  advance_booking_days: number;
  cancellation_hours: number;
}

export interface AdminTimeSlotsResponse {
  slots: TimeSlot[];
  settings: SlotSettings;
  pagination: Pagination;
}

export interface AdminToggleSlotResponse {
  message: string;
  is_active: boolean;
}

export interface AdminBulkToggleResponse {
  message: string;
}

export interface AdminCreateSlotResponse {
  slot_id: number;
  message: string;
}
