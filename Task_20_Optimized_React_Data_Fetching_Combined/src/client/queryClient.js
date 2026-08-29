import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attempt) =>
        Math.min(700 * 2 ** attempt, 3000)
    },
    mutations: {
      retry: 0
    }
  }
});
