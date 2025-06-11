import { getSession } from 'next-auth/react'

export interface AuthFetchOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Create an authenticated fetch function
 */
export function createAuthenticatedFetch(baseUrl?: string) {
  return async function authFetch(
    endpoint: string,
    options: AuthFetchOptions = {}
  ): Promise<Response> {
    const { requireAuth = true, ...fetchOptions } = options
    
    // Add authentication header if required
    if (requireAuth) {
      const session = await getSession()
      
      if (!session?.accessToken) {
        throw new Error('No authentication token available')
      }
      
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    } else {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      }
    }

    // Construct full URL
    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint
    
    const response = await fetch(url, fetchOptions)
    
    // Handle 401 errors
    if (response.status === 401 && requireAuth) {
      // Token might be expired, trigger session refresh
      if (typeof window !== 'undefined') {
        const { signOut } = await import('next-auth/react')
        await signOut({ redirect: false })
        
        // Optionally redirect to login
        window.location.href = '/login?error=session_expired'
      }
      
      throw new Error('Session expired')
    }
    
    return response
  }
}

/**
 * Create an API client with authenticated fetch
 */
export function createApiClient(baseUrl: string) {
  const authFetch = createAuthenticatedFetch(baseUrl)
  
  return {
    /**
     * GET request
     */
    async get<T = any>(endpoint: string, options?: AuthFetchOptions): Promise<T> {
      const response = await authFetch(endpoint, {
        ...options,
        method: 'GET',
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || response.statusText)
      }
      
      if (response.status === 204) {
        return null as any
      }
      
      return response.json()
    },
    
    /**
     * POST request
     */
    async post<T = any>(
      endpoint: string,
      data?: any,
      options?: AuthFetchOptions
    ): Promise<T> {
      const response = await authFetch(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || response.statusText)
      }
      
      if (response.status === 204) {
        return null as any
      }
      
      return response.json()
    },
    
    /**
     * PUT request
     */
    async put<T = any>(
      endpoint: string,
      data?: any,
      options?: AuthFetchOptions
    ): Promise<T> {
      const response = await authFetch(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || response.statusText)
      }
      
      if (response.status === 204) {
        return null as any
      }
      
      return response.json()
    },
    
    /**
     * DELETE request
     */
    async delete<T = any>(endpoint: string, options?: AuthFetchOptions): Promise<T> {
      const response = await authFetch(endpoint, {
        ...options,
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || response.statusText)
      }
      
      if (response.status === 204) {
        return null as any
      }
      
      return response.json()
    },
    
    /**
     * PATCH request
     */
    async patch<T = any>(
      endpoint: string,
      data?: any,
      options?: AuthFetchOptions
    ): Promise<T> {
      const response = await authFetch(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || response.statusText)
      }
      
      if (response.status === 204) {
        return null as any
      }
      
      return response.json()
    },
  }
}