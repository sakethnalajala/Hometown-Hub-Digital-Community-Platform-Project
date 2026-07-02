'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Sparkles } from 'lucide-react'

export interface JobApplicationPayload {
  fullName: string
  email: string
  phone: string
  college: string
  course: string
  coverLetter: string
  resume: string
  jobId?: string
  jobTitle?: string
  company?: string
  salary?: string
  description?: string
}

interface JobSummary {
  title?: string
  company?: string
  salary?: string
  description?: string
}

interface ApplicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobSummary | null | undefined
  onSubmit: (payload: JobApplicationPayload) => void
}

export function ApplicationModal({ open, onOpenChange, job, onSubmit }: ApplicationModalProps) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    coverLetter: '',
    resume: '',
  })

  const handleSubmit = () => {
    onSubmit({
      ...form,
      jobTitle: job?.title,
      company: job?.company,
      salary: job?.salary,
      description: job?.description,
    })
    onOpenChange(false)
  }

  const isReady = useMemo(() => Object.values(form).slice(0, 6).every(Boolean), [form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Application for {job?.title}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Submit your details to apply professionally and receive a confirmation package.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-200">{job?.company}</p>
                <p className="text-lg font-semibold text-white">{job?.title}</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-cyan-200">{job?.salary}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">College</Label>
              <Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Course</Label>
              <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Resume Upload</Label>
              <Input type="text" placeholder="Paste URL or note" value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Cover Letter</Label>
              <Textarea rows={4} value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isReady} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <Sparkles className="mr-2 h-4 w-4" /> Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
