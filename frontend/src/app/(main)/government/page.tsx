'use client'

import { motion } from 'framer-motion'
import {
  Landmark, ExternalLink, FileText, CreditCard, ShieldCheck, Car,
  Receipt, Building2, ArrowUpRight, Globe, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'

interface GovService {
  name: string
  description: string
  icon: LucideIcon
}

/** Five core government services. */
const GOV_SERVICES: GovService[] = [
  { name: 'Aadhaar Services', description: 'Enrol, update and download your Aadhaar — manage your unique identity online.', icon: ShieldCheck },
  { name: 'Passport Application', description: 'Apply for a fresh passport or renewal and track your application status online.', icon: FileText },
  { name: 'PAN Card Services', description: 'Apply for a new PAN, make corrections, and link it with your Aadhaar.', icon: CreditCard },
  { name: 'Driving Licence Services', description: 'Apply for a learner\'s or permanent driving licence and book your driving test.', icon: Car },
  { name: 'Property Tax Payment', description: 'View dues, pay your property tax securely and download instant receipts.', icon: Receipt },
]

const importantLinks = [
  { name: 'DigiLocker – Digital Documents', url: 'https://www.digilocker.gov.in', icon: FileText },
  { name: 'UMANG – Govt Services App', url: 'https://web.umang.gov.in', icon: Globe },
  { name: 'PM Jan Dhan Yojana', url: 'https://pmjdy.gov.in', icon: CreditCard },
  { name: 'National Citizen Portal', url: 'https://serviceonline.gov.in', icon: ShieldCheck },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

export default function GovernmentPage() {
  const openService = (name: string) => {
    // Professional information notification — the online portal for this service
    // is being integrated, so we inform the user clearly instead of doing nothing.
    toast.info(`${name}`, {
      description: 'This service is being integrated and will be available online shortly. Please check back soon.',
    })
  }

  return (
    <PortalBackground portal="government">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #1e40af, #334155)' }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-start gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
            >
              <Landmark className="w-10 h-10 text-white" />
            </motion.div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg">
                <Building2 className="w-4 h-4" />
                Official Services
              </span>
              <h1 className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg">
                Government Services
              </h1>
              <p className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium">
                Access essential civic services, official documents and welfare schemes — all in one trusted place.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOV_SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.name}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group flex flex-col rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl shadow-xl hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/20"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg ring-1 ring-white/20 transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-5 flex-1">
                  {service.description}
                </p>
                <Button
                  onClick={() => openService(service.name)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg"
                >
                  Access Service <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Important Links */}
        <motion.div variants={itemVariants}>
          <h2 className="mb-4 flex items-center gap-2 font-outfit text-xl font-bold text-white">
            <ExternalLink className="h-5 w-5 text-indigo-400" /> Official Portals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {importantLinks.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:border-indigo-400/50 transition-all cursor-pointer group shadow-xl hover:shadow-indigo-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="flex-1 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {link.name}
                    </p>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-300 transition-colors" />
                  </div>
                </motion.div>
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PortalBackground>
  )
}
