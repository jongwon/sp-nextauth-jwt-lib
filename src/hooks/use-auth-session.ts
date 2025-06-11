import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export interface UseAuthSessionOptions {
  required?: boolean
  onUnauthenticated?: () => void
}

/**
 * Enhanced useSession hook with JWT token management
 */
export function useAuthSession(options?: UseAuthSessionOptions) {
  const { data: session, status, update } = useSession({
    required: options?.required,
    onUnauthenticated: options?.onUnauthenticated,
  })
  
  const [isExpired, setIsExpired] = useState(false)
  
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      setIsExpired(true)
    }
  }, [session])
  
  return {
    session,
    status,
    update,
    isExpired,
    isAuthenticated: status === 'authenticated' && !isExpired,
    isLoading: status === 'loading',
    accessToken: session?.accessToken,
    user: session?.user,
  }
}