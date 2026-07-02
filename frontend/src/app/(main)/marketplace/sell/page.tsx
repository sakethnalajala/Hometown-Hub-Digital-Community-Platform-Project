'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { marketplaceApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { isValidImageUrl } from '@/lib/images'

const categories = ['Electronics', 'Fashion', 'Home', 'Food', 'Art', 'Books', 'Sports', 'Health', 'Kids', 'Garden']

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1505740106531-4243f8c4f8fd?w=400&h=400&fit=crop'

export default function SellItemPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
  })

  const mutation = useMutation({
    mutationFn: () => {
      const url = form.imageUrl.trim()
      // Validate the user-supplied image URL; fall back to a placeholder when
      // it is missing or malformed so listings always render a valid image.
      const image = isValidImageUrl(url) ? url : PLACEHOLDER_IMAGE
      if (url && !isValidImageUrl(url)) {
        toast.warning('That image URL looks invalid — using a placeholder image instead.')
      }
      const price = parseFloat(form.price)
      if (!Number.isFinite(price) || price < 0) {
        throw new Error('Please enter a valid price.')
      }
      return marketplaceApi.create({
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        images: [image],
      })
    },
    onSuccess: (res) => {
      toast.success('Item listed successfully!')
      if (res?.data?.id) router.push(`/marketplace/${res.data.id}`)
      else router.push('/marketplace')
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Failed to list item')
      toast.error(error.message)
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
      </Link>
      <div>
        <h1 className="text-3xl font-outfit font-bold">Sell an Item</h1>
        <p className="text-muted-foreground">List a product for sale in your local marketplace.</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Item Name</label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price (₹)</label>
            <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="999" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Image URL (optional)</label>
          <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your item..." />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button className="btn-primary" disabled={mutation.isPending || !form.name || !form.price || !form.description} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            List Item
          </Button>
        </div>
      </div>
    </div>
  )
}
