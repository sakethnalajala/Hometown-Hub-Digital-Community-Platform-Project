'use client'

import { create } from 'zustand'
import { Community } from '@/types'

interface CommunityState {
  joinedCommunities: Community[]
  setJoinedCommunities: (communities: Community[]) => void
  addCommunity: (community: Community) => void
  removeCommunity: (communityId: string) => void
}

export const useCommunityStore = create<CommunityState>((set) => ({
  joinedCommunities: [],
  setJoinedCommunities: (communities) => set({ joinedCommunities: communities }),
  addCommunity: (community) => set((state) => ({ joinedCommunities: [...state.joinedCommunities, community] })),
  removeCommunity: (communityId) => set((state) => ({ joinedCommunities: state.joinedCommunities.filter(c => c.id !== communityId) })),
}))
