'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, Building2, Star, ExternalLink, BookmarkPlus, Loader2, Sparkles, TrendingUp, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jobsApi, bookmarksApi } from '@/lib/api'
import { toast } from 'sonner'
import { PortalBackground } from '@/components/ui/PortalBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { ApplicationModal } from '@/components/ui/ApplicationModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { triggerAppNotification, openExternalLink, downloadTextAsPdf } from '@/lib/appHelpers'

const SAMPLE_JOBS = [
  { id: 'sample-job-1', title: 'Frontend Developer', company: 'TechNova', location: 'Hyderabad', type: 'Full-time', salary: '₹14 LPA', description: 'Build polished dashboards and delightful user interfaces for fast-growing teams.', category: 'Engineering', website: 'https://careers.microsoft.com/' },
  { id: 'sample-job-2', title: 'Data Analyst', company: 'DataSphere', location: 'Bengaluru', type: 'Full-time', salary: '₹10 LPA', description: 'Analyze product and business metrics to support smarter decisions.', category: 'Data', website: 'https://careers.google.com/' },
  { id: 'sample-job-3', title: 'Product Designer', company: 'PixeLab', location: 'Delhi', type: 'Remote', salary: '₹12 LPA', description: 'Craft thoughtful design systems and customer journeys.', category: 'Design', website: 'https://careers.atlassian.com/' },
  { id: 'sample-job-4', title: 'Software Engineer', company: 'CloudBridge', location: 'Pune', type: 'Full-time', salary: '₹16 LPA', description: 'Work on cloud-native products that scale across regions.', category: 'Engineering', website: 'https://careers.amazon.com/' },
  { id: 'sample-job-5', title: 'Operations Manager', company: 'LocalWorks', location: 'Mumbai', type: 'Contract', salary: '₹8 LPA', description: 'Coordinate field operations and drive execution quality.', category: 'Operations', website: 'https://jobs.netflix.com/' },
  { id: 'sample-job-6', title: 'AI Research Intern', company: 'NeuroLabs', location: 'Chennai', type: 'Internship', salary: '₹4 LPA', description: 'Support research and prototyping for next-wave AI products.', category: 'Research', website: 'https://careers.meta.com/' },
  { id: 'sample-job-7', title: 'Sales Executive', company: 'MarketMint', location: 'Kolkata', type: 'Full-time', salary: '₹7 LPA', description: 'Drive partnerships and expand outreach across local markets.', category: 'Sales', website: 'https://careers.salesforce.com/' },
  { id: 'sample-job-8', title: 'HR Generalist', company: 'PeopleFirst', location: 'Ahmedabad', type: 'Full-time', salary: '₹9 LPA', description: 'Support hiring, onboarding, and employee experience programs.', category: 'HR', website: 'https://careers.microsoft.com/' },
  { id: 'sample-job-9', title: 'Mobile Developer', company: 'AppForge', location: 'Jaipur', type: 'Full-time', salary: '₹13 LPA', description: 'Ship polished mobile products with a strong customer focus.', category: 'Engineering', website: 'https://careers.apple.com/' },
  { id: 'sample-job-10', title: 'Customer Success Lead', company: 'SupportHub', location: 'Bengaluru', type: 'Full-time', salary: '₹11 LPA', description: 'Guide clients and build lasting relationships with success programs.', category: 'Customer Success', website: 'https://careers.oracle.com/' },
]

const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Internship', 'Contract']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [saved, setSaved] = useState<string[]>([])
  const [jobs, setJobs] = useState<any[]>(SAMPLE_JOBS)
  const [loading, setLoading] = useState(true)
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    jobsApi.getAll({ limit: 100 })
      .then(res => {
        setJobs(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load jobs')
        setLoading(false)
      })
  }, [])

  const handleSave = async (jobId: string) => {
    try {
      const res = await bookmarksApi.toggle('jobs', jobId)
      const isSaved = res.data?.saved
      setSaved(s => isSaved ? [...s, jobId] : s.filter(id => id !== jobId))
      toast.success(isSaved ? 'Job saved!' : 'Removed from saved')
    } catch {
      setSaved(s => s.includes(jobId) ? s.filter(id => id !== jobId) : [...s, jobId])
      toast.success('Job saved!')
    }
  }

  const handleApply = (jobId: string) => {
    const target = jobs.find(j => j.id === jobId) || null
    if (!target) {
      alert('Unable to load job details. Please try again.')
      return
    }
    setSelectedJob(target)
    setApplicationOpen(true)
  }

  const handleApplicationSubmit = async (payload: any) => {
    const confirmation = `Application Confirmation\nApplicant: ${payload.fullName}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nCollege: ${payload.college}\nCourse: ${payload.course}\nResume: ${payload.resume}\nJob: ${payload.jobTitle}`
    triggerAppNotification('Application submitted', `${payload.jobTitle} application received.`)
    downloadTextAsPdf(`${payload.jobTitle.replace(/\s+/g, '-').toLowerCase()}-application.pdf`, confirmation)
    try {
      await jobsApi.apply(selectedJob?.id || payload.jobId)
    } catch {
      // ignore if the API is not available in demo mode
    }
    openExternalLink(selectedJob?.website || 'https://www.google.com')
  }

  const handleDelete = (jobId: string, title: string) => {
    setJobToDelete({ id: jobId, title })
  }

  const confirmDelete = () => {
    if (!jobToDelete) return
    setJobs((current) => current.filter((job) => job.id !== jobToDelete.id))
    triggerAppNotification('Job deleted', `${jobToDelete.title} was removed from the list.`)
    setJobToDelete(null)
  }

  const filtered = jobs.filter(job => {
    const jobType = job.type || 'Full-time'
    const matchType = activeType === 'All' || jobType === activeType
    const matchSearch = !search ||
      (job.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <PortalBackground portal="jobs">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 px-4 md:px-6 py-8">
        {/* Hero Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #2563eb)' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-20" />

          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="hidden md:flex w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 shadow-2xl"
              >
                <Briefcase className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold mb-4 border border-white/30 shadow-lg"
                >
                  <TrendingUp className="w-4 h-4" />
                  Career Opportunities
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-outfit font-black text-white tracking-tight mb-4 drop-shadow-lg"
                >
                  Local Jobs Portal
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/95 text-lg max-w-2xl leading-relaxed font-medium"
                >
                  Find opportunities near you and build your career with top local employers.
                </motion.p>
              </div>
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 mt-8"
            >
              <div className="relative flex-1 max-w-3xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <Input
                  placeholder="Search jobs, companies, skills..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 bg-white border-white/10 text-gray-900 placeholder:text-gray-500 rounded-2xl h-16 font-medium shadow-2xl focus:ring-4 focus:ring-cyan-400/50 text-lg"
                />
              </div>
              <Button
                onClick={() => toast.info('Use the job-type tabs below to filter listings.')}
                variant="outline"
                className="border-white/20 bg-white/10 backdrop-blur-md text-white h-16 px-8 rounded-2xl hover:bg-white/20 font-bold shadow-2xl"
              >
                <Filter className="w-5 h-5 mr-2" /> Filter
              </Button>
            </motion.div>

            {/* Type Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 mt-6 flex-wrap"
            >
              {jobTypes.map(type => (
                <motion.button
                  key={type}
                  onClick={() => setActiveType(type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg ${
                    activeType === type
                      ? 'bg-white text-blue-600 shadow-xl scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Open Positions', value: loading ? '...' : `${jobs.length}+`, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
            { label: 'Companies Hiring', value: '380+', icon: Building2, color: 'from-cyan-500 to-blue-600' },
            { label: 'Placed This Month', value: '92', icon: Star, color: 'from-blue-600 to-indigo-600' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-center gap-4 shadow-xl"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={itemVariants} className="py-16 text-center text-gray-300 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
            <p className="text-lg">No jobs found. Try adjusting your filters.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.slice(0, 6).map((job: any) => (
              <motion.div key={job.id} variants={itemVariants}>
                <Link href={`/jobs/${job.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:border-cyan-400/50 transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 h-full flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          {(job.company || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">{job.company}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); handleSave(job.id) }}
                        className={`p-2 rounded-xl transition-all ${
                          saved.includes(job.id)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <BookmarkPlus className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1">{job.description}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-5">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Clock className="w-3.5 h-3.5" /> {job.type || 'Full-time'}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                          <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                        </span>
                      )}
                      <span className="ml-auto text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg"
                        onClick={(e) => { e.preventDefault(); handleApply(job.id) }}
                      >
                        Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="border-white/20 text-gray-200 hover:bg-white/10 rounded-xl backdrop-blur-sm">
                        Details
                      </Button>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Post a Job CTA */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10">
            <h3 className="text-white font-black text-2xl mb-2">Are you hiring?</h3>
            <p className="text-gray-200 text-base">Post a job and reach thousands of local professionals in your area.</p>
          </div>
          <Link href="/jobs/create" className="relative z-10">
            <GradientButton variant="blue" size="lg">
              <Sparkles className="w-5 h-5" />
              Post a Job
            </GradientButton>
          </Link>
        </motion.div>
      </motion.div>
      <ApplicationModal open={applicationOpen} onOpenChange={setApplicationOpen} job={selectedJob} onSubmit={handleApplicationSubmit} />
      <ConfirmDialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => !open && setJobToDelete(null)}
        title="Delete job"
        description={`Delete ${jobToDelete?.title || 'this job'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </PortalBackground>
  )
}
