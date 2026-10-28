import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';
import { auth, setToken } from '@/api/api';
import { currentUrl } from '@/lib/authReturnTo';

export const authQuery = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: async () => {
    try {
      const { user } = await auth.me();
      return { user, error: null };
    } catch (err) {
      if (err?.message?.includes('401') || err?.message?.includes('403')) {
        return { user: null, error: null };
      }
      throw err;
    }
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: 'unknown', message: error.message ?? 'Failed to load session' } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: () => {
        setToken(null);
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        window.location.href = '/';
      },
      navigateToLogin: () => {
        window.location.href = `/login?returnTo=${encodeURIComponent(currentUrl())}`;
      },
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
