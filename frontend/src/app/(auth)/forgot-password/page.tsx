'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetUrl, setResetUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email) as { message?: string; data?: { resetUrl?: string } }
      setSent(true)
      if (res.data?.resetUrl) setResetUrl(res.data.resetUrl)
      toast.success(res.message || 'Check your email for reset instructions')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <Link href="/login" className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
        <p className="text-sm text-gray-400 mb-6">
          {sent ? 'If that email exists, instructions have been sent.' : 'Enter your email and we\'ll send reset instructions.'}
        </p>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="email"
                placeholder="demo@hometownhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full btn-primary py-6 rounded-xl">
              {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {resetUrl ? (
              <p className="text-sm text-purple-300 bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                Demo reset link: <Link href={resetUrl.replace('http://localhost:3000', '')} className="underline font-medium">{resetUrl}</Link>
              </p>
            ) : (
              <p className="text-sm text-purple-300 bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                Demo mode: use <strong>demo@hometownhub.com</strong> / <strong>Demo@12345</strong> to sign in.
              </p>
            )}
            <Button onClick={() => router.push('/login')} className="w-full btn-primary rounded-xl">
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
