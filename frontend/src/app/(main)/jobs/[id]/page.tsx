'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { jobsApi, bookmarksApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { PageWrapper, PageSection } from '@/components/ui/PageWrapper'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { MapPin, Clock, DollarSign, ArrowLeft, ExternalLink, BookmarkPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id),
  })

  const applyMutation = useMutation({
    mutationFn: () => jobsApi.apply(id),
    onSuccess: () => toast.success('Application submitted! The employer will contact you soon.'),
    onError: () => toast.error('Application failed. Please try again.'),
  })

  const saveMutation = useMutation({
    mutationFn: () => bookmarksApi.toggle('jobs', id),
    onSuccess: (res) => toast.success(res.data?.saved ? 'Job saved!' : 'Removed from saved'),
  })

  if (isLoading) return <SkeletonCard className="h-96" />
  if (isError || !data?.data) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <p className="text-muted-foreground mb-4">Job not found.</p>
        <Button asChild variant="outline"><Link href="/jobs"><ArrowLeft className="w-4 h-4 mr-2" />Back to Jobs</Link></Button>
      </div>
    )
  }

  const job = data.data
  const skills: string[] = Array.isArray(job.skills) ? job.skills : []

  return (
    <PageWrapper className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
        <Link href="/jobs"><ArrowLeft className="w-4 h-4 mr-2" />Back to Jobs</Link>
      </Button>

      <PageSection>
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {job.companyLogo ? (
                <ImageWithFallback src={job.companyLogo} alt={job.company} className="w-12 h-12 object-cover" />
              ) : (
                <span className="text-2xl">🏢</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{job.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">{job.company}</p>
            </div>
            <Button variant="outline" size="icon" className="border-white/10 shrink-0" onClick={() => saveMutation.mutate()}>
              <BookmarkPlus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-pink-400" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-yellow-400" /> {job.type || 'Full-time'}</span>
            {job.salary && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-green-400" /> {job.salary}</span>}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">{tag}</span>
              ))}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-white mb-2">Job Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2 mt-4">Requirements & Skills</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {skills.length > 0 ? skills.map((tag) => (
                <li key={tag}>{tag} experience</li>
              )) : <li>No specific requirements listed.</li>}
            </ul>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-xl mt-6">
            <h3 className="font-semibold text-white mb-2">About {job.company}</h3>
            <p className="text-sm text-muted-foreground">
              {job.company} is a leading organization based in {job.location}. We are committed to creating an inclusive work environment where diverse teams thrive.
            </p>
          </div>

          {job.author && (
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <Avatar>
                <AvatarImage src={job.author.profileImage} />
                <AvatarFallback>{job.author.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">Posted by {job.author.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl py-7 text-lg font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            disabled={applyMutation.isPending}
            onClick={() => applyMutation.mutate()}
          >
            Apply Now <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </PageSection>
    </PageWrapper>
  )
}
