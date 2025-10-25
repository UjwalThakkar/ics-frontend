'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  FileText,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react'

interface ServiceFee {
  description: string
  amount: number
  currency: string
}

interface Service {
  _id?: string
  serviceId: string
  category: string
  title: string
  description: string
  processingTime: string
  fees: ServiceFee[]
  requiredDocuments: string[]
  eligibilityRequirements: string[]
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewService, setIsNewService] = useState(false)

  const categories = [
    'Passport Services',
    'Visa Services',
    'Police Clearance Certificate',
    'Consular Services',
    'OCI Related Services',
    'Document Attestation',
    'Special Services'
  ]

  const defaultService: Service = {
    serviceId: '',
    category: categories[0],
    title: '',
    description: '',
    processingTime: '',
    fees: [{ description: 'Standard Fee', amount: 0, currency: 'ZAR' }],
    requiredDocuments: [''],
    eligibilityRequirements: [''],
    isActive: true
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, categoryFilter, statusFilter])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/services?includeInactive=true')
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      alert('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(service => service.isActive === isActive)
    }

    setFilteredServices(filtered)
  }

  const openEditModal = (service?: Service) => {
    if (service) {
      setEditingService({ ...service })
      setIsNewService(false)
    } else {
      setEditingService({ ...defaultService })
      setIsNewService(true)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setEditingService(null)
    setShowModal(false)
    setIsNewService(false)
  }

  const saveService = async () => {
    if (!editingService) return

    // Validation
    if (!editingService.serviceId || !editingService.title || !editingService.category) {
      alert('Please fill in all required fields')
      return
    }

    // Check for duplicate service ID (for new services)
    if (isNewService && services.some(s => s.serviceId === editingService.serviceId)) {
      alert('Service ID already exists')
      return
    }

    try {
      const method = isNewService ? 'POST' : 'PUT'
      const response = await fetch('/api/admin/services', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingService)
      })

      const data = await response.json()
      if (data.success) {
        fetchServices()
        closeModal()
        alert(`Service ${isNewService ? 'created' : 'updated'} successfully!`)
      } else {
        alert(`Failed to ${isNewService ? 'create' : 'update'} service: ` + data.error)
      }
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service')
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchServices()
        alert('Service deleted successfully!')
      } else {
        alert('Failed to delete service: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      alert('Failed to delete service')
    }
  }

  const toggleServiceStatus = async (service: Service) => {
    const updatedService = { ...service, isActive: !service.isActive }

    try {
      const response = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedService)
      })

      const data = await response.json()
      if (data.success) {
        fetchServices()
        alert(`Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully!`)
      } else {
        alert('Failed to update service status: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update service status:', error)
      alert('Failed to update service status')
    }
  }

  const exportServices = async () => {
    try {
      const dataStr = JSON.stringify(services, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `services-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } catch (error) {
      console.error('Failed to export services:', error)
      alert('Failed to export services')
    }
  }

  const importServices = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedServices = JSON.parse(text)

      if (Array.isArray(importedServices)) {
        // Validate structure
        const isValid = importedServices.every(service =>
          service.serviceId && service.title && service.category
        )

        if (isValid) {
          // Import services (you might want to show a preview first)
          if (confirm(`Import ${importedServices.length} services? This will add new services and update existing ones.`)) {
            for (const service of importedServices) {
              try {
                await fetch('/api/admin/services', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(service)
                })
              } catch (error) {
                console.error('Failed to import service:', service.serviceId, error)
              }
            }
            fetchServices()
            alert('Services imported successfully!')
          }
        } else {
          alert('Invalid service data structure')
        }
      } else {
        alert('Invalid JSON format')
      }
    } catch (error) {
      console.error('Failed to import services:', error)
      alert('Failed to import services')
    }

    // Reset file input
    event.target.value = ''
  }

  const addArrayItem = (field: 'requiredDocuments' | 'eligibilityRequirements') => {
    if (!editingService) return

    setEditingService({
      ...editingService,
      [field]: [...editingService[field], '']
    })
  }

  const removeArrayItem = (field: 'requiredDocuments' | 'eligibilityRequirements', index: number) => {
    if (!editingService) return

    const newArray = editingService[field].filter((_, i) => i !== index)
    setEditingService({
      ...editingService,
      [field]: newArray
    })
  }

  const updateArrayItem = (field: 'requiredDocuments' | 'eligibilityRequirements', index: number, value: string) => {
    if (!editingService) return

    const newArray = [...editingService[field]]
    newArray[index] = value
    setEditingService({
      ...editingService,
      [field]: newArray
    })
  }

  const addFee = () => {
    if (!editingService) return

    setEditingService({
      ...editingService,
      fees: [...editingService.fees, { description: '', amount: 0, currency: 'ZAR' }]
    })
  }

  const removeFee = (index: number) => {
    if (!editingService) return

    const newFees = editingService.fees.filter((_, i) => i !== index)
    setEditingService({
      ...editingService,
      fees: newFees
    })
  }

  const updateFee = (index: number, field: keyof ServiceFee, value: string | number) => {
    if (!editingService) return

    const newFees = [...editingService.fees]
    newFees[index] = { ...newFees[index], [field]: value }
    setEditingService({
      ...editingService,
      fees: newFees
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
          <p className="text-gray-600">Manage consular services, fees, and requirements</p>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importServices}
            className="hidden"
            id="import-services"
          />
          <label
            htmlFor="import-services"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer flex items-center text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </label>

          <button
            onClick={exportServices}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={() => openEditModal()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredServices.length} of {services.length} services
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing & Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading services...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No services found
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.serviceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{service.title}</div>
                        <div className="text-sm text-gray-500">{service.serviceId}</div>
                        <div className="text-xs text-gray-400 mt-1">{service.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.processingTime}
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {service.fees.length > 0
                            ? `${service.fees[0].currency} ${service.fees[0].amount}`
                            : 'No fees'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-1" />
                          {service.requiredDocuments.length} documents
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {service.eligibilityRequirements.length} requirements
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleServiceStatus(service)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.isActive ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {service.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Service"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.serviceId)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      {showModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {isNewService ? 'Add New Service' : 'Edit Service'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service ID *
                  </label>
                  <input
                    type="text"
                    value={editingService.serviceId}
                    onChange={(e) => setEditingService({...editingService, serviceId: e.target.value})}
                    disabled={!isNewService}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingService.title}
                    onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Time
                  </label>
                  <input
                    type="text"
                    value={editingService.processingTime}
                    onChange={(e) => setEditingService({...editingService, processingTime: e.target.value})}
                    placeholder="e.g., 5-7 days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingService.isActive}
                      onChange={(e) => setEditingService({...editingService, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Service</span>
                  </label>
                </div>
              </div>

              {/* Fees Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Fees</h4>
                  <button
                    onClick={addFee}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Fee
                  </button>
                </div>

                <div className="space-y-3">
                  {editingService.fees.map((fee, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={fee.description}
                          onChange={(e) => updateFee(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={fee.amount}
                          onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={fee.currency}
                          onChange={(e) => updateFee(index, 'currency', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        >
                          <option value="ZAR">ZAR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <button
                          onClick={() => removeFee(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Required Documents</h4>
                  <button
                    onClick={() => addArrayItem('requiredDocuments')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Document
                  </button>
                </div>

                <div className="space-y-2">
                  {editingService.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={doc}
                        onChange={(e) => updateArrayItem('requiredDocuments', index, e.target.value)}
                        placeholder="Document requirement"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem('requiredDocuments', index)}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Requirements */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Eligibility Requirements</h4>
                  <button
                    onClick={() => addArrayItem('eligibilityRequirements')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Requirement
                  </button>
                </div>

                <div className="space-y-2">
                  {editingService.eligibilityRequirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayItem('eligibilityRequirements', index, e.target.value)}
                        placeholder="Eligibility requirement"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem('eligibilityRequirements', index)}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveService}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isNewService ? 'Create Service' : 'Update Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceManagement
