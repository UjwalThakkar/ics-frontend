// src/pages/admin/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { phpAPI } from "@/lib/php-api-client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";
import ApplicationFilters from "@/components/admin/applications/ApplicationFilters";
import ApplicationsTable from "@/components/admin/applications/ApplicationsTable";
import AppointmentFilters from "@/components/admin/appointments/AppointmentFilters";
import AppointmentsTable from "@/components/admin/appointments/AppointmentsTable";
import { Stats, Application, Appointment, Pagination } from "@/types/admin";
import { Loader2, AlertCircle, Calendar, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Shared
  const [error, setError] = useState<string | null>(null);

  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [appPagination, setAppPagination] = useState<Pagination | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appPage, setAppPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptPagination, setApptPagination] = useState<Pagination | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptPage, setApptPage] = useState(1);
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatus, setApptStatus] = useState("");
  const [apptCenterId, setApptCenterId] = useState("");
  const [apptDateFrom, setApptDateFrom] = useState("");
  const [apptDateTo, setApptDateTo] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshAppointments = () => {
    console.log("refresh called");
    setRefreshTrigger((p) => p + 1);
  };

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) window.location.href = "/admin";
  }, []);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await phpAPI.admin.getDashboardStats();
        if (res.success) setStats(res.stats);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch Applications
  useEffect(() => {
    if (activeTab !== "applications") return;
    const fetch = async () => {
      setLoadingApps(true);
      setError(null);
      try {
        const res = await phpAPI.admin.getApplications({
          page: appPage,
          limit: 20,
          status: statusFilter || undefined,
        });
        if (res.success) {
          setApplications(res.applications || []);
          setAppPagination(res.pagination || null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingApps(false);
      }
    };
    fetch();
  }, [activeTab, appPage, statusFilter]);

  // Fetch Appointments
  useEffect(() => {
    if (activeTab !== "appointments") return;
    const fetch = async () => {
      setLoadingAppts(true);
      setError(null);
      try {
        const res = await phpAPI.admin.getAppointments({
          page: apptPage,
          limit: 20,
          status: apptStatus || undefined,
          centerId: apptCenterId || undefined,
          dateFrom: apptDateFrom || undefined,
          dateTo: apptDateTo || undefined,
          search: apptSearch || undefined,
        });
        if (res.success) {
          setAppointments(res.appointments || []);
          setApptPagination(res.pagination || null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetch();
  }, [
    activeTab,
    apptPage,
    apptStatus,
    apptCenterId,
    apptDateFrom,
    apptDateTo,
    apptSearch,
    refreshTrigger,
  ]);

  const exportData = () => {
    const data = {
      stats,
      applications: activeTab === "applications" ? applications : undefined,
      appointments: activeTab === "appointments" ? appointments : undefined,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consular-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    phpAPI.logout();
    window.location.href = "/admin";
  };

  return (
    <AdminLayout onExport={exportData} onLogout={handleLogout}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <DashboardOverview
            stats={stats}
            loading={loadingStats}
            error={error}
          />
        )}

        {activeTab === "applications" && (
          <>
            <ApplicationFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setCurrentPage={setAppPage}
            />
            {loadingApps && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {error && !loadingApps && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {applications.length === 0 && !loadingApps && !error && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No applications found.</p>
              </div>
            )}
            {applications.length > 0 && (
              <ApplicationsTable
                applications={applications}
                pagination={appPagination}
                currentPage={appPage}
                setCurrentPage={setAppPage}
              />
            )}
          </>
        )}

        {activeTab === "appointments" && (
          <>
            <AppointmentFilters
              search={apptSearch}
              setSearch={setApptSearch}
              status={apptStatus}
              setStatus={setApptStatus}
              centerId={apptCenterId}
              setCenterId={setApptCenterId}
              dateFrom={apptDateFrom}
              setDateFrom={setApptDateFrom}
              dateTo={apptDateTo}
              setDateTo={setApptDateTo}
              setPage={setApptPage}
            />
            {loadingAppts && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {error && !loadingAppts && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {appointments.length === 0 && !loadingAppts && !error && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments found.</p>
              </div>
            )}
            {appointments.length > 0 && (
              <AppointmentsTable
                appointments={appointments}
                pagination={apptPagination}
                currentPage={apptPage}
                setCurrentPage={setApptPage}
                refresh={refreshAppointments}
              />
            )}
          </>
        )}

        {["users", "settings"].includes(activeTab) && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Management
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
