'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communitiesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  isPrivate: z.boolean(),
})

type FormValues = z.infer<typeof createSchema>

export default function CreateCommunityPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    description: '',
    city: '',
    country: 'India',
    isPrivate: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  const mutation = useMutation({
    mutationFn: (data: any) => communitiesApi.create(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Community created successfully')
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      router.push(`/communities/${res.data.slug}`)
    },
    onError: (error: any) => {
      toast.error(error.data?.message || 'Failed to create community')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      createSchema.parse(formData)
      setErrors({})
      mutation.mutate(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: any = {}
        const zodError = error as any
        zodError.errors.forEach((err: any) => {
          if (err.path[0]) newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-bold tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Create Community</h1>
        <p className="text-muted-foreground">Start a new hub for your hometown.</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Community Name</label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pune Techies"
              className={errors.name ? 'border-brand-error' : ''}
            />
            {errors.name && <p className="text-xs text-brand-error">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this community about?"
              rows={4}
              className={errors.description ? 'border-brand-error' : ''}
            />
            {errors.description && <p className="text-xs text-brand-error">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City/Village</label>
              <Input
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune"
                className={errors.city ? 'border-brand-error' : ''}
              />
              {errors.city && <p className="text-xs text-brand-error">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. India"
                className={errors.country ? 'border-brand-error' : ''}
              />
              {errors.country && <p className="text-xs text-brand-error">{errors.country}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border/50">
            <div>
              <p className="font-medium">Private Community</p>
              <p className="text-sm text-muted-foreground">Only approved members can view posts</p>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={checked => setFormData({ ...formData, isPrivate: checked })}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-8 shadow-lg shadow-purple-900/30 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Community
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
