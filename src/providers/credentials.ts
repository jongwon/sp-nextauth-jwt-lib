import CredentialsProvider from 'next-auth/providers/credentials'
import type { AuthConfig, SignInCredentials, AuthResponse } from '../types'

/**
 * Create a credentials provider for email/password authentication
 */
export function createCredentialsProvider(config: AuthConfig) {
  const signinUrl = `${config.apiEndpoints.baseUrl}${config.apiEndpoints.signin || '/api/auth/signin'}`

  return CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      try {
        const response = await fetch(signinUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          } as SignInCredentials),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || error.message || 'Login failed')
        }

        const data: AuthResponse = await response.json()
        
        // Return user object with JWT token
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.image,
          accessToken: data.token,
        }
      } catch (error: any) {
        console.error('Login error:', error)
        throw new Error(error.message || 'Login failed')
      }
    }
  })
}