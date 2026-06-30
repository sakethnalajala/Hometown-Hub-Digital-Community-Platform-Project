'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap, BrainCircuit, Code2, Cloud, ShieldCheck, BarChart3, Sparkles,
  ArrowUpRight, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'

interface EduItem {
  title: string
  provider: string
  description: string
  icon: LucideIcon
  image: string
}

/** Five curated, high-quality educational resources. */
const EDUCATION_ITEMS: EduItem[] = [
  {
    title: 'AI & Machine Learning Academy',
    provider: 'DeepMind Institute',
    description: 'Master neural networks, deep learning and model deployment through hands-on, industry-led projects.',
    icon: BrainCircuit,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop&auto=format&q=70',
  },
  {
    title: 'Full Stack Web Development',
    provider: 'CodeCraft Academy',
    description: 'Build complete web apps end-to-end with React, Node.js and databases — from first commit to deployment.',
    icon: Code2,
    image: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&h=400&fit=crop&auto=format&q=70',
  },
  {
    title: 'Cloud Computing Essentials',
    provider: 'CloudPro Training',
    description: 'Learn AWS, Azure and DevOps fundamentals to design, scale and secure modern cloud infrastructure.',
    icon: Cloud,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&auto=format&q=70',
  },
  {
    title: 'Cybersecurity Training',
    provider: 'SecureNet Labs',
    description: 'Defend systems against real-world threats with ethical hacking, network security and incident response.',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop&auto=format&q=70',
  },
  {
    title: 'Data Science Masterclass',
    provider: 'DataWiz Institute',
    description: 'Turn raw data into insight with Python, statistics, visualisation and predictive analytics.',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=70',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

export default function EducationPage() {
  const openResource = (title: string) => {
    toast.success(`${title} opened successfully.`, {
      description: 'More educational resources are being added soon.',
    })
  }

  return (
    <PortalBackground portal="education">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 px-4 md:px-6 py-8">
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9, #06b6d4)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="relative z-10 flex items-start gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Learning Resources
              </span>
              <h1 className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg">
                Education Hub
              </h1>
              <p className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium">
                Courses, scholarships and learning resources — everything you need to grow your skills and advance your education.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Resource Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDUCATION_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-xl hover:border-teal-400/50 hover:shadow-2xl hover:shadow-teal-500/20"
              >
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 shadow-lg ring-1 ring-white/20">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-300/90 mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {item.provider}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5 flex-1">
                    {item.description}
                  </p>
                  <Button
                    onClick={() => openResource(item.title)}
                    className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white rounded-xl font-bold shadow-lg"
                  >
                    Open Course <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </PortalBackground>
  )
}
