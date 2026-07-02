"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { downloadTextAsPdf, triggerAppNotification, openExternalLink } from '@/lib/appHelpers'
import { jobsApi } from '@/lib/api'
import { FileText, ExternalLink } from 'lucide-react'

interface JobApplicationDetails {
  title?: string
  company?: string
  location?: string
  type?: string
  description?: string
  website?: string
  companyWebsite?: string
}

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobApplicationDetails | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', college: '', course: '', resume: '', coverLetter: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    jobsApi.getById(params.id).then(res => setJob(res.data ?? null)).catch(() => setJob(null))
  }, [params.id])

  const handleSubmit = async () => {
    setSubmitting(true)
    // generate PDF confirmation
    const confirmation = `Application Confirmation\nApplicant: ${form.fullName}\nEmail: ${form.email}\nPhone: ${form.phone}\nCollege: ${form.college}\nCourse: ${form.course}\nJob: ${job?.title}`
    downloadTextAsPdf(`${(job?.title || 'application').replace(/\s+/g, '-')}-confirmation.pdf`, confirmation)
    triggerAppNotification('Application submitted', `${job?.title} application received.`)
    try { await jobsApi.apply(params.id) } catch { /* ignore */ }
    // redirect to company careers page if available
    const companyUrl = job?.website || job?.companyWebsite || 'https://www.google.com'
    openExternalLink(companyUrl)
    setSubmitting(false)
    router.push('/jobs')
  }

  if (job === null) return (
    <div className="max-w-4xl mx-auto p-8 text-white">Loading job details...</div>
  )

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-2xl font-bold">{(job?.company || 'C')[0]}</div>
          <div>
            <h1 className="text-2xl font-bold">Apply: {job?.title}</h1>
            <p className="text-sm text-gray-300">{job?.company} • {job?.location} • {job?.type}</p>
          </div>
          <a href={job?.website || '#'} target="_blank" rel="noreferrer" className="ml-auto text-sm text-cyan-300 flex items-center gap-2"><ExternalLink className="w-4 h-4"/> Company Site</a>
        </div>

        <div className="mb-6 text-gray-300">
          <p className="mb-2 font-semibold">Job Description</p>
          <p className="text-sm">{job?.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Full Name</Label>
            <Input value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Phone</Label>
            <Input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">College</Label>
            <Input value={form.college} onChange={e=>setForm({...form, college: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Course</Label>
            <Input value={form.course} onChange={e=>setForm({...form, course: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Resume (paste URL)</Label>
            <Input value={form.resume} onChange={e=>setForm({...form, resume: e.target.value})} className="bg-white/5 text-white" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Cover Letter</Label>
            <Textarea rows={5} value={form.coverLetter} onChange={e=>setForm({...form, coverLetter: e.target.value})} className="bg-white/5 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={()=>router.push('/jobs')} className="border-white/10">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-cyan-500 to-blue-500" disabled={submitting}>
            <FileText className="mr-2 h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  )
}
