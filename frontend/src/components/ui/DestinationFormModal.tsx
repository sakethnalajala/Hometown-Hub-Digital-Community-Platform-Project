'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Compass, Save } from 'lucide-react'
import type { LocalDestination } from '@/lib/localDestinations'

const CATEGORIES = ['Nature', 'Heritage', 'Hill Station', 'Wildlife', 'Beach', 'Adventure']

export interface DestinationFormValues {
  name: string
  category: string
  location: string
  description: string
  bestSeason: string
  rating: number
  image: string
}

interface DestinationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DestinationFormValues) => void
  editing?: LocalDestination | null
}

const EMPTY_FORM: DestinationFormValues = {
  name: '',
  category: 'Nature',
  location: '',
  description: '',
  bestSeason: '',
  rating: 4.5,
  image: '',
}

export function DestinationFormModal({ open, onOpenChange, onSubmit, editing }: DestinationFormModalProps) {
  const [form, setForm] = useState<DestinationFormValues>(EMPTY_FORM)

  useEffect(() => {
    // Resets the form to match whichever destination (if any) is being
    // edited whenever the modal opens — a legitimate prop-to-state sync.
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: editing.name,
        category: editing.category,
        location: editing.location,
        description: editing.description,
        bestSeason: editing.bestSeason,
        rating: editing.rating,
        image: editing.image,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editing, open])

  const isReady = Boolean(form.name.trim() && form.location.trim() && form.description.trim())

  const handleSubmit = () => {
    if (!isReady) return
    onSubmit(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" /> {editing ? 'Edit Destination' : 'Create Destination'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Destination Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g. Emerald Falls"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g. Coorg, Karnataka"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="What makes this destination worth visiting?"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Best Season</Label>
            <Input
              value={form.bestSeason}
              onChange={(e) => setForm({ ...form, bestSeason: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g. October – March"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Rating (1–5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 4.5 })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Image URL</Label>
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://images.unsplash.com/..."
            />
            <p className="text-xs text-slate-400">Leave blank to use an auto-generated placeholder image.</p>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isReady} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <Save className="mr-2 h-4 w-4" /> {editing ? 'Save Changes' : 'Create Destination'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
