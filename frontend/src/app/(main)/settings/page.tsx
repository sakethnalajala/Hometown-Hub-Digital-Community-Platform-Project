'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Lock, Eye, EyeOff, Palette, Globe, Shield, LogOut, ChevronRight, Save, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { usersApi, authApi } from '@/lib/api'
import { toast } from 'sonner'
import { applyAppTheme, getStoredTheme } from '@/lib/appHelpers'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

type TabId = 'profile' | 'notifications' | 'privacy' | 'appearance'

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(getStoredTheme())
  const [notifications, setNotifications] = useState({
    emailDigest: true,
    communityUpdates: true,
    eventReminders: true,
    newMessages: true,
    jobAlerts: false,
    marketplaceOffers: false,
  })

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    hometown: user?.hometown || '',
    currentCity: user?.currentCity || '',
  })

  useEffect(() => {
    applyAppTheme(theme)
  }, [theme])

  const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: User },
    { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
    { id: 'privacy' as TabId, label: 'Privacy & Security', icon: Shield },
    { id: 'appearance' as TabId, label: 'Appearance', icon: Palette },
  ]

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPass.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      await authApi.changePassword(passwordForm.current, passwordForm.newPass)
      toast.success('Password updated successfully!')
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const res = await usersApi.updateMe({
        name: profileData.name,
        bio: profileData.bio,
        hometown: profileData.hometown,
        currentCity: profileData.currentCity,
      })
      updateUser(res.data)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-400" /> Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and settings</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <motion.div variants={itemVariants} className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-purple-400' : ''}`} />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => { logout(); toast.success('Logged out successfully') }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants} className="md:col-span-3">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> Profile Information
              </h2>

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-sm">@{user?.username}</p>
                  <Button variant="outline" size="sm" className="mt-2 border-white/10 text-gray-300 hover:bg-white/10 rounded-xl text-xs h-8">
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Username', key: 'username', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Hometown', key: 'hometown', type: 'text' },
                  { label: 'Current City', key: 'currentCity', type: 'text' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'email' || field.key === 'hometown' ? 'sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4' : ''}>
                    <div className={field.key === 'email' || field.key === 'hometown' ? '' : ''}>
                      <label className="text-xs font-medium text-gray-300 mb-1.5 block">{field.label}</label>
                      <Input
                        type={field.type}
                        value={profileData[field.key as keyof typeof profileData]}
                        onChange={e => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-purple-500"
                      />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-300 mb-1.5 block">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                    placeholder="Tell your community about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" /> Notification Preferences
              </h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => {
                  const labels: Record<string, { title: string; desc: string }> = {
                    emailDigest: { title: 'Email Digest', desc: 'Receive a weekly email summary of activity' },
                    communityUpdates: { title: 'Community Updates', desc: 'New posts and announcements from your communities' },
                    eventReminders: { title: 'Event Reminders', desc: 'Reminders for upcoming events you RSVP\'d to' },
                    newMessages: { title: 'New Messages', desc: 'Alerts when someone sends you a message' },
                    jobAlerts: { title: 'Job Alerts', desc: 'New job postings matching your profile' },
                    marketplaceOffers: { title: 'Marketplace Offers', desc: 'Offers and price drops on saved listings' },
                  }
                  const info = labels[key]
                  return (
                    <div key={key} className="flex items-start justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-white font-medium text-sm">{info?.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{info?.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(key as keyof typeof notifications)}
                        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${value ? 'bg-purple-500' : 'bg-white/10'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" /> Privacy & Security
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                  <h3 className="text-white font-medium text-sm mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Current password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl pr-10" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Input type="password" placeholder="New password" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl" />
                    <Input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl" />
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl" disabled={changingPassword} onClick={handleChangePassword}>
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>

                {[
                  { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', badge: 'Recommended' },
                  { title: 'Active Sessions', desc: 'View and manage your active login sessions', badge: '1 active' },
                  { title: 'Data Privacy', desc: 'Control what data is stored and how it\'s used', badge: null },
                ].map(item => (
                  <div key={item.title} className="p-4 bg-white/3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        {item.badge && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{item.badge}</span>}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" /> Appearance
              </h2>

              <div>
                <h3 className="text-white font-medium text-sm mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark' as const, label: 'Dark', icon: Moon },
                    { value: 'light' as const, label: 'Light', icon: Sun },
                    { value: 'system' as const, label: 'System', icon: Monitor },
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); applyAppTheme(t.value); toast.success(`Theme set to ${t.label}`) }}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        theme === t.value ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/3 hover:bg-white/10'
                      }`}
                    >
                      <t.icon className={`w-5 h-5 ${theme === t.value ? 'text-purple-400' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${theme === t.value ? 'text-purple-300' : 'text-gray-400'}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium text-sm mb-3">Language</h3>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:border-purple-500">
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
