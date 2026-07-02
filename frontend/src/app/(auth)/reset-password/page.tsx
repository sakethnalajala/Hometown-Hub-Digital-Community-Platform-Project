'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) { toast.error('Invalid reset link'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      toast.success('Password updated! Please log in.')
      router.push('/login')
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-400 text-sm">This reset link is invalid or expired.</p>
        <Button asChild className="btn-primary rounded-xl"><Link href="/forgot-password">Request New Link</Link></Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type={show ? 'text' : 'password'}
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10 pr-10 bg-white/5 border-white/10 text-white rounded-xl"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="bg-white/5 border-white/10 text-white rounded-xl"
      />
      <p className="text-xs text-gray-500">Must be 8+ chars with uppercase letter and number</p>
      <Button type="submit" disabled={loading} className="w-full btn-primary py-6 rounded-xl">
        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <Link href="/login" className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
        <p className="text-sm text-gray-400 mb-6">Choose a strong password for your account.</p>
        <Suspense fallback={<Loader2 className="animate-spin mx-auto text-purple-400" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </motion.div>
  )
}
