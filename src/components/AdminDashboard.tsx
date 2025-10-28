"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Settings,
  Home,
  Download,
  Calendar,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import { phpAPI } from "@/lib/php-api-client";

interface Stats {
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

interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  // Add more as needed
}

interface Application {
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // -----------------------------------------------------------------
  // 1. Auth check
  // -----------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/admin";
    }
  }, []);

  // -----------------------------------------------------------------
  // 2. Fetch Dashboard Stats
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const response = await phpAPI.admin.getDashboardStats();
        if (response.success && response.stats) {
          setStats(response.stats);
        }
      } catch (err: any) {
        console.error("Stats error:", err);
        setError(err.message || "Failed to load stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    // -----------------------------------------------------------------
    // 3. Fetch Applications
    // -----------------------------------------------------------------
    const fetchApplications = async (page: number = 1) => {
      setLoadingApps(true);
      setError(null);
      try {
        const params: any = { page, limit };
        if (statusFilter) params.status = statusFilter;

        const response = await phpAPI.admin.getApplications(params);

        if (response.success) {
          setApplications(response.applications || []);
          setPagination(response.pagination || null);
        } else {
          setError("Failed to load applications");
        }
      } catch (err: any) {
        console.error("Applications error:", err);
        setError(err.message || "Network error");
      } finally {
        setLoadingApps(false);
      }
    };
    if (activeTab === "applications") {
      fetchApplications(currentPage);
    }
  }, [activeTab, currentPage, statusFilter, limit]);

  // -----------------------------------------------------------------
  // Parse applicant_info JSON safely
  // -----------------------------------------------------------------
  const parseApplicantInfo = (infoStr: string): ApplicantInfo | null => {
    try {
      return JSON.parse(infoStr);
    } catch {
      return null;
    }
  };

  // -----------------------------------------------------------------
  // Status Badge
  // -----------------------------------------------------------------
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // -----------------------------------------------------------------
  // Export
  // -----------------------------------------------------------------
  const exportData = () => {
    const data = {
      stats,
      applications,
      pagination,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consular-admin-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -----------------------------------------------------------------
  // Tabs
  // -----------------------------------------------------------------
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    
  ];

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Indian Consular Services - Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => {
                  phpAPI.logout();
                  window.location.href = "/admin";
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white w-64 min-h-screen shadow-sm">
          <div className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Dashboard Overview
              </h2>

              {loadingStats && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading stats…</span>
                </div>
              )}

              {error && !loadingStats && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Total Applications
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.applications.total}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Submitted Today
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.applications.today}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.applications.this_month}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Today’s Appointments
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.appointments.today}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Applications Management
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID or name..."
                      className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Loading */}
              {loadingApps && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Loading applications…
                  </span>
                </div>
              )}

              {/* Error */}
              {error && !loadingApps && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Empty State */}
              {!loadingApps && applications.length === 0 && !error && (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No applications found.</p>
                </div>
              )}

              {/* Table */}
              {applications.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            App ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => {
                          const info = parseApplicantInfo(app.applicant_info);
                          const name = info
                            ? `${info.firstName} ${info.lastName}`.trim()
                            : "N/A";
                          const email = info?.email || "N/A";
                          const phone = info?.phone || "N/A";

                          return (
                            <tr key={app.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {app.application_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{email}</div>
                                <div>{phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {app.service_title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    app.status
                                  )}`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  app.submitted_at
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-t">
                      <div className="text-sm text-gray-700">
                        Page{" "}
                        <span className="font-medium">{pagination.page}</span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {pagination.totalPages}
                        </span>{" "}
                        ({pagination.total} total)
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(pagination.totalPages, p + 1)
                            )
                          }
                          disabled={currentPage === pagination.totalPages}
                          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Placeholder Tabs */}
          {["appointments", "users", "settings"].includes(activeTab) && (
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
      </div>
    </div>
  );
}
