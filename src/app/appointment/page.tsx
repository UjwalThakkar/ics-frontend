'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function AppointmentPage() {
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    documents: ''
  })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Service categories with specific timeslots
  const serviceCategories = {
    'visa-services': {
      name: 'Visa Services',
      slots: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
      duration: 30, // minutes
      maxDaily: 21,
      color: 'bg-green-500'
    },
    'passport-services': {
      name: 'Passport Services',
      slots: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
      duration: 45,
      maxDaily: 12,
      color: 'bg-blue-500'
    },
    'oci-services': {
      name: 'OCI/PIO Services',
      slots: ['09:30', '10:30', '11:30', '12:30'],
      duration: 60,
      maxDaily: 4,
      color: 'bg-purple-500'
    },
    'attestation-services': {
      name: 'Document Attestation',
      slots: ['09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30'],
      duration: 15,
      maxDaily: 26,
      color: 'bg-orange-500'
    },
    'birth-death-services': {
      name: 'Birth/Death Services',
      slots: ['09:30', '10:15', '11:00', '11:45', '12:30'],
      duration: 45,
      maxDaily: 5,
      color: 'bg-red-500'
    },
    'misc-services': {
      name: 'Miscellaneous Services',
      slots: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
      duration: 30,
      maxDaily: 14,
      color: 'bg-indigo-500'
    }
  }

  // Generate next 30 days (excluding weekends)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    let currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() + 1) // Start from tomorrow

    while (dates.length < 30) {
      const dayOfWeek = currentDate.getDay()
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  const availableDates = generateAvailableDates()

  // Load available slots when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      setIsLoading(true)

      // Simulate loading and checking availability
      setTimeout(() => {
        const category = serviceCategories[selectedService as keyof typeof serviceCategories]
        if (category) {
          // Simulate some slots being taken (for demo)
          const allSlots = category.slots
          const takenSlots = Math.floor(Math.random() * 3) // Random taken slots
          const available = allSlots.slice(takenSlots)

          setAvailableSlots(available)
        }
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedService, selectedDate])

  const handleBooking = async () => {
    setIsLoading(true)

    // Simulate booking API call
    setTimeout(() => {
      const bookingRef = `APT${Date.now()}`

      // Show confirmation
      alert(`🎉 Appointment Booked Successfully!\n\n📅 Reference: ${bookingRef}\n📅 Service: ${serviceCategories[selectedService as keyof typeof serviceCategories]?.name}\n📅 Date: ${new Date(selectedDate).toLocaleDateString()}\n📅 Time: ${selectedTime}\n📅 Email: ${bookingData.email}\n\n📞 Contact: +27 11 895 0460\n\n💡 You will receive a confirmation email shortly.`)

      // Reset form
      setStep(1)
      setSelectedService('')
      setSelectedDate('')
      setSelectedTime('')
      setBookingData({ name: '', email: '', phone: '', purpose: '', documents: '' })
      setIsLoading(false)
    }, 2000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Book an <span className="text-saffron">Appointment</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule your visit to the Indian Consulate Services office. All appointments must be booked in advance.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 1, title: 'Service' },
              { step: 2, title: 'Date & Time' },
              { step: 3, title: 'Details' },
              { step: 4, title: 'Confirmation' }
            ].map((s, index) => (
              <div key={s.step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.step ? 'bg-saffron text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s.step}
                </div>
                <span className={`ml-2 font-medium ${step >= s.step ? 'text-saffron' : 'text-gray-500'}`}>
                  {s.title}
                </span>
                {index < 3 && <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Service Category</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(serviceCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedService(key)}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                      selectedService === key
                        ? 'border-saffron bg-orange-50'
                        : 'border-gray-200 hover:border-saffron/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-4 h-4 rounded-full ${category.color} mr-3`}></div>
                      <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p><Clock className="w-4 h-4 inline mr-2" />Duration: {category.duration} minutes</p>
                      <p><Calendar className="w-4 h-4 inline mr-2" />Available slots: {category.slots.length} per day</p>
                      <p><User className="w-4 h-4 inline mr-2" />Max appointments: {category.maxDaily} daily</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="px-8 py-3 bg-saffron text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  Next: Select Date & Time
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setStep(1)} className="mr-4 p-2 text-gray-600 hover:text-saffron">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Select Date & Time</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Dates</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                        className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                          selectedDate === date.toISOString().split('T')[0]
                            ? 'bg-saffron text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                        <div>{date.getDate()}/{date.getMonth() + 1}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Times</h3>
                  {selectedDate ? (
                    <div>
                      {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                                selectedTime === time
                                  ? 'bg-saffron text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-8 py-3 bg-saffron text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  Next: Enter Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setStep(2)} className="mr-4 p-2 text-gray-600 hover:text-saffron">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit *
                  </label>
                  <input
                    type="text"
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    placeholder="e.g., Passport renewal, Visa application"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents to Submit
                  </label>
                  <textarea
                    value={bookingData.documents}
                    onChange={(e) => setBookingData({...bookingData, documents: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    placeholder="List the documents you'll be submitting..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!bookingData.name || !bookingData.email || !bookingData.phone}
                  className="px-8 py-3 bg-saffron text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  Review & Confirm
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Your Appointment</h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Service Details</h3>
                    <p className="text-sm text-gray-600">Category: {serviceCategories[selectedService as keyof typeof serviceCategories]?.name}</p>
                    <p className="text-sm text-gray-600">Duration: {serviceCategories[selectedService as keyof typeof serviceCategories]?.duration} minutes</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Date & Time</h3>
                    <p className="text-sm text-gray-600">Date: {formatDate(new Date(selectedDate))}</p>
                    <p className="text-sm text-gray-600">Time: {selectedTime}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
                    <p className="text-sm text-gray-600">Name: {bookingData.name}</p>
                    <p className="text-sm text-gray-600">Email: {bookingData.email}</p>
                    <p className="text-sm text-gray-600">Phone: {bookingData.phone}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Purpose</h3>
                    <p className="text-sm text-gray-600">{bookingData.purpose}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Important Notes:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Please arrive 15 minutes before your appointment time</li>
                      <li>• Bring all original documents and 2 sets of attested copies</li>
                      <li>• Late arrivals may need to reschedule their appointment</li>
                      <li>• Confirmation email will be sent to your email address</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Office Hours */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Office Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700">Submission</h4>
              <p className="text-blue-600">Monday - Friday: 9:30 AM - 12:30 PM</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Collection</h4>
              <p className="text-blue-600">Monday - Friday: 3:00 PM - 4:30 PM</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Emergency</h4>
              <p className="text-blue-600">Call: +27 82 809 4646</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
