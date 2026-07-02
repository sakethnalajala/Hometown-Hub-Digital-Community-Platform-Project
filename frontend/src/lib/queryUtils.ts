// Optimistic Update Helper for React Query
// This improves CRUD operations by updating UI immediately before server response

import { QueryClient } from '@tanstack/react-query'

interface OptimisticUpdateOptions<T> {
  queryKey: string[]
  updater: (old: T) => T
}

export function setupOptimisticUpdate<T>({
  queryKey,
  updater,
}: OptimisticUpdateOptions<T>) {
  return {
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot current value
      const previousData = queryClient.getQueryData<T>(queryKey)

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<T>(queryKey, updater(previousData))
      }

      return { previousData }
    },

    onError: (err: Error, _context?: unknown) => {
      // Rollback on error
      const context = _context as { previousData?: T } | undefined
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey })
    },
  }
}

// Create a singleton QueryClient instance with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})
