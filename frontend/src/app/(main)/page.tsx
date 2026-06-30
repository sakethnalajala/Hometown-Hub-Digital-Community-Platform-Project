'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'
import { Post } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageSquare, Share2, ThumbsUp, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => postsApi.getComments(postId),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => postsApi.addComment(postId, { content }),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast.success('Comment added!')
    },
    onError: () => toast.error('Failed to add comment'),
  })

  const comments = data?.data || []

  return (
    <div className="w-full px-2 pb-2 space-y-3">
      <div className="flex gap-2">
        <Textarea placeholder="Write a comment..." value={text} onChange={(e) => setText(e.target.value)} rows={2} className="resize-none text-sm" />
        <Button size="icon" className="shrink-0 self-end" disabled={!text.trim() || commentMutation.isPending} onClick={() => commentMutation.mutate(text.trim())}>
          {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-1">No comments yet.</p>
      ) : (
        comments.map((c: any) => (
          <div key={c.id} className="flex gap-3 py-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={c.author?.profileImage} />
              <AvatarFallback>{c.author?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{c.author?.name}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-sm mt-0.5">{c.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function FeedPostCard({
  post,
  likedPosts,
  onLike,
  onShare,
}: {
  post: Post
  likedPosts: Set<string>
  onLike: () => void
  onShare: () => void
}) {
  const [commentsOpen, setCommentsOpen] = useState(false)

  return (
    <Card className="card overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start gap-4">
        <Avatar>
          <AvatarImage src={post.author.profileImage} />
          <AvatarFallback>{post.author?.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{post.author.name}</span>
            <span className="text-sm text-muted-foreground">@{post.author.username}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          {post.community && <div className="text-xs text-primary font-medium mt-0.5">{post.community.name}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <ImageWithFallback src={post.images[0]} alt="Post" className="w-full h-48 rounded-xl mt-4 object-cover" />
        )}
      </CardContent>
      <CardFooter className="p-2 border-t flex flex-col gap-0">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2" onClick={onLike}>
            <ThumbsUp className={`h-4 w-4 ${post.isLiked || likedPosts.has(post.id) ? 'fill-primary text-primary' : ''}`} />
            <span>{post.likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2" onClick={() => setCommentsOpen(!commentsOpen)}>
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2" onClick={onShare}>
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
        {commentsOpen && (
          <div className="w-full border-t border-border/50 mt-2 pt-2">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default function FeedPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore()
  const queryClient = useQueryClient()
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [composerOpen, setComposerOpen] = useState(false)
  const [postContent, setPostContent] = useState('')

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postsApi.like(postId),
    onSuccess: (_, postId) => {
      setLikedPosts(prev => new Set(prev).add(postId))
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const shareMutation = useMutation({
    mutationFn: (postId: string) => postsApi.share(postId),
    onSuccess: () => toast.success('Post shared!'),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('type', 'TEXT')
      return postsApi.create(formData)
    },
    onSuccess: () => {
      setPostContent('')
      setComposerOpen(false)
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast.success('Post published!')
    },
    onError: () => toast.error('Failed to create post'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => postsApi.getFeed(),
    enabled: isAuthenticated,
  })

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const posts = data?.data || []

  return (
    <PageWrapper className="max-w-2xl mx-auto space-y-6">
      <PageSection>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-outfit font-bold tracking-tight gradient-text">Your Feed</h1>
        </div>
      </PageSection>

      <Card className="glass-card mb-8">
        <CardContent className="p-4">
          <div className="flex gap-4 items-start">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback>{user?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              {!composerOpen ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="w-full text-left bg-muted rounded-full px-4 py-2.5 text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  What&apos;s happening in your hometown?
                </button>
              ) : (
                <>
                  <Textarea
                    placeholder="Share something with your community..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={3}
                    autoFocus
                    className="resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setComposerOpen(false); setPostContent('') }}>Cancel</Button>
                    <Button size="sm" className="btn-primary" disabled={!postContent.trim() || createMutation.isPending} onClick={() => createMutation.mutate(postContent.trim())}>
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Post
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {isLoading ? (
          <SkeletonGrid count={3} cols="grid-cols-1" />
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No posts yet. Create a post above to get started!</p>
          </div>
        ) : (
          posts.map((post: Post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              likedPosts={likedPosts}
              onLike={() => likeMutation.mutate(post.id)}
              onShare={() => shareMutation.mutate(post.id)}
            />
          ))
        )}
      </div>
    </PageWrapper>
  )
}
