'use client'

import React, { useState } from 'react'
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react'
import IndianEmblem from '@/components/IndianEmblem'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    otp: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'credentials' | 'otp' | 'authenticated'>('credentials')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication process
    setTimeout(() => {
      if (step === 'credentials') {
        // Validate credentials and move to OTP
        setStep('otp')
      } else if (step === 'otp') {
        // Validate OTP and authenticate
        setStep('authenticated')
        setIsLoggedIn(true)
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setStep('credentials')
    setLoginData({ username: '', password: '', otp: '' })
  }

  if (isLoggedIn) {
    return <AdminDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30L30 30zM15 15l15 15-15 15V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Government Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <IndianEmblem size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-blue-200">
            Consulate General of India, Johannesburg
          </p>
          <div className="w-16 h-0.5 bg-saffron mx-auto mt-3"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/15 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header */}
          <div className="bg-white/10 px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-saffron" />
              <span className="text-white font-medium">
                {step === 'credentials' ? 'Officer Login' : 'Two-Factor Authentication'}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {step === 'credentials' && (
                <>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Officer ID / Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                      <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/40 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-saffron focus:border-transparent"
                        placeholder="Enter your officer ID"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-saffron focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 'otp' && (
                <div>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-8 w-8 text-saffron" />
                    </div>
                    <h3 className="text-white font-medium mb-1">Enter Verification Code</h3>
                    <p className="text-white/60 text-sm">
                      A 6-digit code has been sent to your registered device
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={loginData.otp}
                      onChange={(e) => setLoginData({ ...loginData, otp: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg tracking-widest placeholder-white/50 focus:ring-2 focus:ring-saffron focus:border-transparent"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-saffron hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {step === 'credentials' ? 'Authenticating...' : 'Verifying...'}
                  </>
                ) : (
                  step === 'credentials' ? 'Continue' : 'Verify & Login'
                )}
              </button>
            </form>

            {step === 'otp' && (
              <button
                onClick={() => setStep('credentials')}
                className="w-full mt-3 text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to login
              </button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-red-500/20 border-t border-red-500/30 px-6 py-3">
            <div className="flex items-center space-x-2 text-red-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                Authorized Personnel Only - All access is logged and monitored
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Info */}
        <div className="mt-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">System Access Levels</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-white/70">
                <span>Consular Officer:</span>
                <span>Application Management</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Senior Officer:</span>
                <span>Full System Access</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Admin:</span>
                <span>System Configuration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-200 text-xs text-center">
            <strong>Demo Credentials:</strong> Username: officer123 | Password: demo2025
          </p>
        </div>
      </div>
    </div>
  )
}
