'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { HeartPulse, Sparkles } from 'lucide-react'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hospital: any
  onSubmit: (payload: any) => void
}

export function AppointmentModal({ open, onOpenChange, hospital, onSubmit }: AppointmentModalProps) {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    mobile: '',
    email: '',
    address: '',
    medicalProblem: '',
    symptoms: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
  })

  const isReady = useMemo(() => Object.values(form).slice(0, 8).every(Boolean), [form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" /> Book appointment at {hospital?.name}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Fill the details below to request a professional consultation and receive a confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-white">Full Name</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Age</Label>
            <Input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Gender</Label>
            <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Blood Group</Label>
            <Input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Mobile Number</Label>
            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Address</Label>
            <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Medical Problem</Label>
            <Input value={form.medicalProblem} onChange={(e) => setForm({ ...form, medicalProblem: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Symptoms</Label>
            <Input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Preferred Doctor</Label>
            <Input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Appointment Date</Label>
            <Input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Appointment Time</Label>
            <Input type="time" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
          <Button onClick={() => { onSubmit(form); onOpenChange(false) }} disabled={!isReady} className="bg-gradient-to-r from-rose-500 to-red-500 text-white">
            <Sparkles className="mr-2 h-4 w-4" /> Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
