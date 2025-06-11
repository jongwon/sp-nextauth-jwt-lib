import { useCallback } from 'react'
import { useAuthSession } from './use-auth-session'
import { createApiClient } from '../utils'

/**
 * Hook for authenticated API calls
 */
export function useAuthenticatedFetch(baseUrl: string) {
  const { accessToken, isAuthenticated } = useAuthSession()
  
  const apiClient = useCallback(() => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated')
    }
    
    return createApiClient(baseUrl)
  }, [baseUrl, isAuthenticated])
  
  return {
    apiClient: isAuthenticated ? apiClient() : null,
    isAuthenticated,
    accessToken,
  }
}