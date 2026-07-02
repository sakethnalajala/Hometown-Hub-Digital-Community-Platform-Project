'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeartPulse, Search, Phone, MapPin, Clock, Star, Stethoscope, Pill, Ambulance, Shield, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { healthcareApi } from '@/lib/api'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { triggerAppNotification, downloadTextAsPdf } from '@/lib/appHelpers'
import { AppointmentModal, type AppointmentPayload } from '@/components/ui/AppointmentModal'
import { PortalBackground } from '@/components/ui/PortalBackground'
import type { Hospital, HealthScheme } from '@/types'

const emergencyContacts = [
  { label: 'Ambulance', number: '108', icon: Ambulance, color: 'text-red-400' },
  { label: 'Police', number: '100', icon: Shield, color: 'text-blue-400' },
  { label: 'Fire Service', number: '101', icon: HeartPulse, color: 'text-orange-400' },
  { label: 'Women Helpline', number: '1091', icon: Phone, color: 'text-pink-400' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function HealthcarePage() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [healthSchemes, setHealthSchemes] = useState<HealthScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingState, setBookingState] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [appointmentOpen, setAppointmentOpen] = useState(false)

  useEffect(() => {
    Promise.all([healthcareApi.getHospitals(), healthcareApi.getSchemes()])
      .then(([h, s]) => {
        setHospitals(h.data || [])
        setHealthSchemes(s.data || [])
      })
      .catch(() => toast.error('Failed to load healthcare data'))
      .finally(() => setLoading(false))
  }, [])

  const types = ['All', 'Multi-specialty', 'Primary Care', 'Pediatric', 'Alternative Medicine']

  const handleBookAppointment = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setAppointmentOpen(true)
  }

  const handleAppointmentSubmit = (payload: AppointmentPayload) => {
    const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}`
    const confirmation = `Appointment Confirmation\nAppointment ID: ${appointmentId}\nHospital: ${selectedHospital?.name}\nPatient: ${payload.fullName}\nAge: ${payload.age}\nGender: ${payload.gender}\nMobile: ${payload.mobile}\nEmail: ${payload.email}\nAddress: ${payload.address}\nBlood Group: ${payload.bloodGroup}\nHealth Problem: ${payload.medicalProblem}\nSymptoms: ${payload.symptoms}\nPreferred Doctor: ${payload.doctor}\nDate: ${payload.appointmentDate}\nTime: ${payload.appointmentTime}`

    setBookingState(true)
    downloadTextAsPdf(`${appointmentId}.pdf`, confirmation)
    triggerAppNotification('Appointment booked', `Your appointment request was saved with ID ${appointmentId}.`)
    toast.success(`Appointment confirmed for ${selectedHospital?.name}`)
    setBookingState(false)
  }

  const filtered = hospitals.filter((h: Hospital) => {
    const matchType = activeType === 'All' || h.type === activeType
    const matchSearch = !search || String(h.name || '').toLowerCase().includes(search.toLowerCase()) || String(h.type || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <PortalBackground portal="healthcare">
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Emergency Banner */}
      <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Ambulance className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Medical Emergency?</p>
            <p className="text-gray-400 text-sm">Call 108 for immediate ambulance assistance</p>
          </div>
        </div>
        <div className="flex gap-3">
          {emergencyContacts.map(c => (
            <a key={c.label} href={`tel:${c.number}`} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
              <c.icon className={`w-5 h-5 ${c.color}`} />
              <span className="text-white font-bold text-sm">{c.number}</span>
              <span className="text-gray-400 text-xs">{c.label}</span>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600/20 via-red-600/10 to-transparent border border-white/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Healthcare</h1>
              <p className="text-gray-400">Find hospitals, clinics, and health schemes near you</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search hospitals, specialities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl h-11"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeType === type ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hospitals List */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-white mb-4">
              {loading ? 'Loading facilities...' : `${filtered.length} Healthcare Facilities`}
            </h2>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <HeartPulse className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No facilities found.</p>
              </div>
            ) : (
              filtered.slice(0, 6).map((hospital: Hospital) => (
                <motion.div
                  key={String(hospital.id || hospital.name)}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-40 h-36 sm:h-auto overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={hospital.image} alt={String(hospital.name || '')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold group-hover:text-rose-300 transition-colors">{String(hospital.name || '')}</h3>
                            {hospital.emergency && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">24/7 Emergency</span>
                            )}
                          </div>
                          <span className="text-xs text-rose-400 font-medium">{String(hospital.type || 'General')} Hospital</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                          <Star className="w-4 h-4 fill-current" /> {Number(hospital.rating || 0)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(Array.isArray(hospital.specialities) ? hospital.specialities : []).map((spec: string) => (
                          <span key={spec} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300">{spec}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {String(hospital.distance || hospital.address || 'Nearby')}</span>
                        <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-blue-400" /> {Number(hospital.beds || 0)} beds</span>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl" onClick={() => handleBookAppointment(hospital)} disabled={bookingState}>
                          {bookingState ? 'Booking...' : 'Book Appointment'}
                        </Button>
                        <a href={`tel:${hospital.phone}`}>
                          <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10 rounded-xl">
                            <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-rose-400" /> Health Schemes
            </h3>
            <div className="space-y-3">
              {healthSchemes.slice(0, 5).map((scheme: HealthScheme) => (
                <div key={String(scheme.id || scheme.name)} className={`bg-gradient-to-br ${scheme.color || 'from-rose-600/20 to-red-600/20'} border ${scheme.border || 'border-rose-500/20'} rounded-xl p-4`}>
                  <h4 className="text-white font-medium text-sm">{String(scheme.name || '')}</h4>
                  <p className="text-gray-400 text-xs mt-1">{String(scheme.description || '')}</p>
                  <Button size="sm" variant="ghost" className="text-white h-7 px-2 mt-2 text-xs hover:bg-white/10" onClick={() => toast.info(scheme.description)}>Learn More →</Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Health Tips
            </h3>
            {[
              'Drink 8 glasses of water daily',
              'Exercise for at least 30 min/day',
              'Get 7–9 hours of sleep',
              'Eat a balanced diet with seasonal vegetables',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0 text-sm text-gray-400">
                <HeartPulse className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                {tip}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} hospital={selectedHospital} onSubmit={handleAppointmentSubmit} />
    </motion.div>
    </PortalBackground>
  )
}
