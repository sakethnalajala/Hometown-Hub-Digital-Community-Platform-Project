'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CreateJobPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    description: '',
    skills: '',
  })

  const mutation = useMutation({
    mutationFn: () => jobsApi.create({
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      companyLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.company)}`,
    }),
    onSuccess: () => {
      toast.success('Job posted successfully!')
      router.push('/jobs')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to post job'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>
      <div>
        <h1 className="text-3xl font-outfit font-bold">Post a Job</h1>
        <p className="text-muted-foreground">Reach local professionals in your community.</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Title</label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Salary</label>
            <Input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="₹8–12 LPA" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / City" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills (comma-separated)</label>
          <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, SQL" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Job responsibilities and requirements..." />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button className="btn-primary" disabled={mutation.isPending || !form.title || !form.company || !form.description} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish Job
          </Button>
        </div>
      </div>
    </div>
  )
}
