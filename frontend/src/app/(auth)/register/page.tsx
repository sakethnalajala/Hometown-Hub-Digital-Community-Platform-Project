'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { auth, db, googleProvider } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, User, MapPin, Eye, EyeOff } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  hometown: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState<RegisterFormValues>({ 
    name: '', username: '', email: '', password: '', hometown: '' 
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name as keyof RegisterFormValues]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      registerSchema.parse(formData)
      setErrors({})
      setIsLoading(true)
      
      // DEMO MODE BYPASS
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        try {
          const res = await authApi.register({ name: formData.name, username: formData.username, email: formData.email, password: formData.password, hometown: formData.hometown });
          if (res.data) {
            login(res.data.user, res.data.accessToken, res.data.refreshToken);
            toast.success('[Demo Mode] Account created successfully!');
            router.push('/dashboard');
          }
          return;
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          console.error('Demo Register Error:', err);
          toast.error(err.message || 'Registration failed. Use demo@hometownhub.com in demo mode.');
          setIsLoading(false);
          return;
        }
      }

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      const idToken = await user.getIdToken()
      
      // 2. Save user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        hometown: formData.hometown,
        createdAt: new Date().toISOString()
      })
      
      // 3. Exchange token with backend
      const res = await authApi.loginFirebase({ 
        idToken,
        name: formData.name,
        username: formData.username,
        hometown: formData.hometown
      })
      
      if (res.data) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken)
        toast.success('Account created successfully!')
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message
        })
        setErrors(newErrors as Partial<Record<keyof RegisterFormValues, string>>)
      } else {
        const err = error instanceof Error ? error : new Error('Unknown error')
        toast.error(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      // DEMO MODE BYPASS
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        try {
          const res = await authApi.login({ email: 'demo@hometownhub.com', password: 'Demo@12345' });
          if (res.data) {
            login(res.data.user, res.data.accessToken, res.data.refreshToken);
            toast.success('[Demo Mode] Google Sign-In simulated successfully!');
            router.push('/dashboard');
          }
          return;
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          console.error('Demo Google Login Error:', err);
          toast.error(err.message || 'Demo Login failed');
          setIsGoogleLoading(false);
          return;
        }
      }

      // 1. Authenticate with Firebase Google Provider
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()
      
      // Save to Firestore just in case they don't exist
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'User',
        email: user.email,
        createdAt: new Date().toISOString()
      }, { merge: true })

      // 2. Exchange token with backend
      const res = await authApi.loginFirebase({ idToken })
      
      if (res.data) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken)
        toast.success('Google Sign-In successful!')
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Google Sign-In failed')
      console.error('Google Sign-In Error:', err)
      toast.error(err.message)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full relative"
    >
      {/* Floating Glassmorphism Card */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden"
      >
        {/* Neon glow effect on the border */}
        <div className="absolute inset-0 rounded-[24px] pointer-events-none border border-transparent [background:linear-gradient(45deg,transparent,rgba(168,85,247,0.3),transparent)_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor]" />

        <div className="space-y-2 text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-sm text-gray-400">
            Join your hometown community today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="name">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  id="name" name="name" placeholder="John Doe" 
                  value={formData.name} onChange={handleChange} 
                  className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="username">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  id="username" name="username" placeholder="johndoe" 
                  value={formData.username} onChange={handleChange} 
                  className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${errors.username ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.username && <p className="text-[10px] text-red-400 ml-1">{errors.username}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="email">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input 
                id="email" name="email" type="email" placeholder="m@example.com" 
                value={formData.email} onChange={handleChange} 
                className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="password">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input 
                id="password" name="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={formData.password} onChange={handleChange} 
                className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-400 ml-1">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="hometown">Hometown (Optional)</label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input 
                id="hometown" name="hometown" placeholder="Where are you from?" 
                value={formData.hometown} onChange={handleChange} 
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl py-6 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-300 origin-center opacity-0 group-active:opacity-100" />
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 mb-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400 text-xs uppercase tracking-wider backdrop-blur-xl">Or continue with</span>
            </div>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full relative z-10 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl py-6 transition-all"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              <GoogleIcon />
              Sign up with Google
            </>
          )}
        </Button>

        <div className="text-center text-sm mt-8 relative z-10 text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
