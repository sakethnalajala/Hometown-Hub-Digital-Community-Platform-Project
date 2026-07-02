'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communitiesApi, postsApi } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import { Users, MapPin, MessageSquare, ThumbsUp, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface CommunityPost {
  id: string
  content: string
  createdAt: string
  images?: string[]
  likeCount: number
  commentCount: number
  author?: {
    profileImage?: string
    name?: string
    username?: string
  }
}

interface CommunityModerator {
  id: string
  profileImage?: string
  name?: string
  username?: string
}

export default function CommunityDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const queryClient = useQueryClient()
  const [joined, setJoined] = useState(false)
  const [newPost, setNewPost] = useState('')

  const { data: communityData, isLoading, isError } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communitiesApi.getBySlug(slug),
  })

  const community = communityData?.data

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', community?.id],
    queryFn: () => communitiesApi.getPosts(community!.id),
    enabled: !!community?.id,
  })

  const joinMutation = useMutation({
    mutationFn: () => communitiesApi.join(community!.id),
    onSuccess: () => {
      setJoined(true)
      toast.success(`Joined ${community?.name}!`)
      queryClient.invalidateQueries({ queryKey: ['community', slug] })
    },
    onError: () => toast.error('Failed to join community'),
  })

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postsApi.like(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] })
    },
  })

  const createPostMutation = useMutation({
    mutationFn: (content: string) => {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('type', 'TEXT')
      formData.append('communityId', community!.id)
      return postsApi.create(formData)
    },
    onSuccess: () => {
      setNewPost('')
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] })
      queryClient.invalidateQueries({ queryKey: ['community', slug] })
      toast.success('Post published!')
    },
    onError: () => toast.error('Failed to create post. Join the community first.'),
  })

  if (isLoading) return <SkeletonGrid count={3} />
  if (isError || !community) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <p className="text-muted-foreground">Community not found.</p>
      </div>
    )
  }

  const posts = postsData?.data || []

  return (
    <PageWrapper className="space-y-6">
      {/* Banner */}
      <PageSection>
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden">
          <ImageWithFallback
            src={community.bannerImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit">{community.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(community.memberCount || 0).toLocaleString()} members</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{community.city}</span>
              <span className="badge badge-primary">{community.category?.name}</span>
            </div>
          </div>
        </div>
      </PageSection>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <PageSection>
            <p className="text-muted-foreground">{community.description}</p>
          </PageSection>

          {/* Post composer */}
          <PageSection>
            <div className="glass-card p-4 flex gap-3">
              <Input
                placeholder={`Share something with ${community.name}...`}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <Button
                className="btn-primary shrink-0"
                disabled={!newPost.trim() || createPostMutation.isPending}
                onClick={() => createPostMutation.mutate(newPost.trim())}
              >
                {createPostMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
              </Button>
            </div>
          </PageSection>

          {/* Posts */}
          <PageSection>
            <h2 className="text-lg font-bold text-white mb-4 font-outfit">Discussions</h2>
            {postsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : posts.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">No posts yet. Be the first to share!</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post: CommunityPost) => {
                  const postImages = Array.isArray(post.images) ? post.images : []
                  return (
                  <div key={post.id} className="glass-card p-5 hover:border-purple-500/20 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author?.profileImage} />
                        <AvatarFallback>{post.author?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white text-sm">{post.author?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/90 mb-4">{post.content}</p>
                    {postImages.length > 0 && (
                      <ImageWithFallback src={postImages[0]} alt="" className="w-full h-48 rounded-xl mb-4" />
                    )}
                    <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary" onClick={() => likeMutation.mutate(post.id)}>
                        <ThumbsUp className="h-4 w-4" /> {post.likeCount}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" /> {post.commentCount}
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </PageSection>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-4">
          <PageSection>
            <div className="glass-card p-5 space-y-4">
              <Button
                className={`w-full rounded-xl py-6 font-bold text-md shadow-lg transition-all ${joined ? 'bg-white/10 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white animate-pulse-glow'}`}
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || joined}
              >
                {joined ? 'Joined ✓' : joinMutation.isPending ? <Loader2 className="animate-spin" /> : 'Join Community'}
              </Button>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl font-bold text-white">{community.memberCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl font-bold text-white">{community.postCount || posts.length}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>
            </div>
          </PageSection>

          {community.moderators && (
            <PageSection>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> Moderators
                </h3>
                <div className="space-y-3">
                  {community.moderators.map((mod: CommunityModerator) => (
                    <div key={mod.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={mod.profileImage} />
                        <AvatarFallback>{mod.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{mod.name}</p>
                        <p className="text-xs text-muted-foreground">@{mod.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PageSection>
          )}

          {community.rules && community.rules.length > 0 && (
            <PageSection>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> Community Rules
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                  {community.rules.map((rule: string, i: number) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ol>
              </div>
            </PageSection>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
