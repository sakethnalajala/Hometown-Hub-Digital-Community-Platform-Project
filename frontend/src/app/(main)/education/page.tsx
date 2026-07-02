'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap, BrainCircuit, Code2, Cloud, ShieldCheck, BarChart3, Sparkles,
  ArrowUpRight, BookOpen, Database, Cpu, Palette, Rocket, Microscope, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { triggerAppNotification, openExternalLink } from '@/lib/appHelpers'

interface EduItem {
  title: string
  provider: string
  description: string
  duration: string
  difficulty: string
  icon: LucideIcon
  image: string
  url: string
}

/** A broader, high-quality set of educational resources with direct links to trusted learning platforms. */
const INITIAL_EDUCATION_ITEMS: EduItem[] = [
  {
    title: 'Full Stack Web Development',
    provider: 'The Odin Project',
    description: 'Build complete web apps end-to-end with HTML, CSS, JavaScript, React and Node.js.',
    duration: '12 Weeks',
    difficulty: 'Intermediate',
    icon: Code2,
    image: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.theodinproject.com/',
  },
  {
    title: 'Python Programming',
    provider: 'Python.org',
    description: 'Master Python fundamentals with real-world scripting, automation and data workflows.',
    duration: '8 Weeks',
    difficulty: 'Beginner',
    icon: BrainCircuit,
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.python.org/about/gettingstarted/',
  },
  {
    title: 'Artificial Intelligence',
    provider: 'Elements of AI',
    description: 'Explore AI foundations, neural networks and practical model building projects.',
    duration: '10 Weeks',
    difficulty: 'Intermediate',
    icon: BrainCircuit,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.elementsofai.com/',
  },
  {
    title: 'Data Science',
    provider: 'Khan Academy',
    description: 'Turn raw data into insight with statistics, probability and visualisation.',
    duration: '10 Weeks',
    difficulty: 'Intermediate',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.khanacademy.org/math/statistics-probability',
  },
  {
    title: 'Cloud Computing',
    provider: 'AWS Training',
    description: 'Learn the basics of cloud architecture, deployment and infrastructure services.',
    duration: '6 Weeks',
    difficulty: 'Beginner',
    icon: Cloud,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://aws.amazon.com/training/digital/',
  },
  {
    title: 'Cybersecurity Basics',
    provider: 'Cisco Networking Academy',
    description: 'Understand online safety, threat detection and secure digital habits.',
    duration: '7 Weeks',
    difficulty: 'Beginner',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://skillsforall.com/',
  },
  {
    title: 'UI/UX Design',
    provider: 'Google UX Design',
    description: 'Create polished interfaces and user journeys grounded in real research.',
    duration: '8 Weeks',
    difficulty: 'Beginner',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
  },
  {
    title: 'Product Management',
    provider: 'Coursera',
    description: 'Learn how to shape ideas, prioritize features and launch successful products.',
    duration: '9 Weeks',
    difficulty: 'Intermediate',
    icon: Rocket,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.coursera.org/specializations/product-management',
  },
  {
    title: 'Database Design',
    provider: 'MongoDB University',
    description: 'Understand data models, indexing and scalable database architecture.',
    duration: '6 Weeks',
    difficulty: 'Intermediate',
    icon: Database,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://learn.mongodb.com/',
  },
  {
    title: 'Machine Learning',
    provider: 'Fast.ai',
    description: 'Build practical machine learning systems with modern tools and approachable lessons.',
    duration: '8 Weeks',
    difficulty: 'Intermediate',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://course.fast.ai/',
  },
  {
    title: 'Research Skills',
    provider: 'NPTEL',
    description: 'Strengthen academic writing, evidence gathering and critical thinking skills.',
    duration: '5 Weeks',
    difficulty: 'Beginner',
    icon: Microscope,
    image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://archive.nptel.ac.in/',
  },
  {
    title: 'Communication & Presentation',
    provider: 'LinkedIn Learning',
    description: 'Explore storytelling, speaking and presentation techniques for everyday impact.',
    duration: '4 Weeks',
    difficulty: 'Beginner',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop&auto=format&q=70',
    url: 'https://www.linkedin.com/learning/',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

export default function EducationPage() {
  const visibleItems = useMemo(() => INITIAL_EDUCATION_ITEMS, [])

  const openResource = (item: EduItem) => {
    triggerAppNotification('Course opened', `${item.title} opened successfully.`)
    openExternalLink(item.url)
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
          {visibleItems.map((item) => {
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
                  <p className="text-sm text-gray-300 leading-relaxed mb-3 flex-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-teal-200 mb-4">
                    <span className="rounded-full bg-white/10 px-2 py-1">{item.duration}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">{item.difficulty}</span>
                  </div>
                  <Button
                    onClick={() => openResource(item)}
                    className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white rounded-xl font-bold shadow-lg"
                  >
                    Visit Website <ArrowUpRight className="w-4 h-4 ml-1.5" />
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
