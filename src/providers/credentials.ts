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
      password: { label: 'Password', type: 'password' },
      token: { label: 'Token', type: 'text' },
      refreshToken: { label: 'Refresh Token', type: 'text' },
      isOAuthCallback: { label: 'OAuth Callback', type: 'text' }
    },
    async authorize(credentials) {
      // OAuth callback 처리
      if (credentials?.isOAuthCallback === 'true' && credentials?.token && credentials?.refreshToken) {
        try {
          // 토큰으로 사용자 정보 조회
          const meUrl = `${config.apiEndpoints.baseUrl}${config.apiEndpoints.userInfo || '/api/auth/me'}`
          const response = await fetch(meUrl, {
            headers: {
              'Authorization': `Bearer ${credentials.token}`
            }
          })
          
          if (!response.ok) {
            throw new Error('Failed to get user info')
          }
          
          const user = await response.json()
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            accessToken: credentials.token,
            refreshToken: credentials.refreshToken
          }
        } catch (error) {
          console.error('OAuth callback error:', error)
          return null
        }
      }
      
      // 일반 이메일/패스워드 로그인
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