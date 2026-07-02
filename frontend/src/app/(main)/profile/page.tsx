'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, MapPin, Camera, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

function UserPostsTab({ userId }: { userId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => usersApi.getPosts(userId!),
    enabled: !!userId,
  })
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
  const posts = data?.data || []
  if (!posts.length) return <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed"><p className="text-muted-foreground">No posts yet</p></div>
  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <div key={post.id} className="glass-card p-4">
          <p className="text-sm">{post.content}</p>
          <p className="text-xs text-muted-foreground mt-2">{post.likeCount} likes · {post.commentCount} comments</p>
        </div>
      ))}
    </div>
  )
}

function UserCommunitiesTab({ userId }: { userId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-communities', userId],
    queryFn: () => usersApi.getCommunities(userId!),
    enabled: !!userId,
  })
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
  const communities = data?.data || []
  if (!communities.length) return <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed"><p className="text-muted-foreground">No communities joined yet</p></div>
  return (
    <div className="grid gap-3">
      {communities.map((c: any) => (
        <Link key={c.id} href={`/communities/${c.slug}`}>
          <div className="glass-card p-4 hover:border-primary/30 transition-all flex items-center justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{(c.memberCount || 0).toLocaleString()} members</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', bio: '', hometown: '', currentCity: '' })

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isAuthLoading, router])

  const { data: profileDataContent, isLoading: isProfileLoading, refetch } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => usersApi.getMe(),
    enabled: isAuthenticated,
  })

  // Sync form data when profile loads - using ref to prevent unnecessary updates
  const handleEditStart = () => {
    if (profileDataContent?.data) {
      setEditData({
        name: profileDataContent.data.name || '',
        bio: profileDataContent.data.bio || '',
        hometown: profileDataContent.data.hometown || '',
        currentCity: profileDataContent.data.currentCity || '',
      })
    }
    setIsEditing(true)
  }

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateMe(data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      setIsEditing(false)
      if (res.data) updateUser(res.data)
      refetch()
    },
    onError: () => toast.error('Failed to update profile')
  })

  const avatarMutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.uploadAvatar(formData),
    onSuccess: (res) => {
      toast.success('Avatar updated')
      if (res.data) updateUser({ profileImage: res.data.profileImage })
      refetch()
    },
    onError: () => toast.error('Failed to upload avatar')
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData()
      formData.append('avatar', e.target.files[0])
      avatarMutation.mutate(formData)
    }
  }

  if (isAuthLoading || isProfileLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  const profile = profileDataContent?.data

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-slate-950/95 group border border-white/10 shadow-2xl">
        {profile?.coverImage ? (
          <ImageWithFallback src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30" />
        )}
        {/* Cover edit button could go here */}
      </div>

      <div className="relative px-4 sm:px-6 -mt-16 sm:-mt-24 mb-8 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="relative group self-start">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white/15 bg-slate-900/90 shadow-xl">
            <AvatarImage src={profile?.profileImage} />
            <AvatarFallback className="text-4xl">{profile?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarMutation.isPending} />
            {avatarMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </label>
        </div>

        <div className="flex-1 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-outfit">{profile?.name}</h1>
              <p className="text-muted-foreground">@{profile?.username}</p>
            </div>
            {!isEditing && (
              <Button onClick={handleEditStart} variant="outline">Edit Profile</Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-5 bg-[#111827]/95 border-white/10">
            <h3 className="font-semibold mb-4 text-white">About</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Name</label>
                  <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Bio</label>
                  <Textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Hometown</label>
                  <Input value={editData.hometown} onChange={e => setEditData({...editData, hometown: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Current City</label>
                  <Input value={editData.currentCity} onChange={e => setEditData({...editData, currentCity: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => updateMutation.mutate(editData)} disabled={updateMutation.isPending} className="flex-1 btn-primary">
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="icon"><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {profile?.bio && <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>}
                
                <div className="space-y-2 mt-4">
                  {profile?.hometown && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> From <span className="font-medium text-foreground">{profile.hometown}</span>
                    </div>
                  )}
                  {profile?.currentCity && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Lives in <span className="font-medium text-foreground">{profile.currentCity}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground mt-4 pt-4 border-t border-border/50">
                    <span>Joined {format(new Date(profile?.createdAt ? new Date(profile.createdAt as string).getTime() : 0), 'MMMM yyyy')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card p-5 bg-[#111827]/95 border-white/10">
            <h3 className="font-semibold mb-4 text-white">Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{profile?._count?.posts || 0}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{profile?._count?.communityMemberships || 0}</div>
                <div className="text-xs text-muted-foreground">Communities</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Posts</TabsTrigger>
              <TabsTrigger value="communities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Communities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-0">
              <UserPostsTab userId={profile?.id || user?.id} />
            </TabsContent>
            
            <TabsContent value="communities" className="mt-0">
              <UserCommunitiesTab userId={profile?.id || user?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
