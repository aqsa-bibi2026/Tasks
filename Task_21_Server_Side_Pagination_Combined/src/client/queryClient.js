import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({defaultOptions:{queries:{staleTime:20000,gcTime:300000,retry:2,refetchOnWindowFocus:false}}});
