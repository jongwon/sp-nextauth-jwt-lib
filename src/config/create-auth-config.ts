import type { NextAuthOptions } from 'next-auth'
import { createCredentialsProvider, createOAuth2Provider } from '../providers'
import type { AuthConfig, AuthResponse } from '../types'

/**
 * Create NextAuth configuration with JWT integration
 */
export function createAuthConfig(config: AuthConfig): NextAuthOptions {
  // Filter enabled providers
  const enabledProviders = config.providers.filter(provider => 
    provider.enabled !== false
  )
  
  // Check if password auth is enabled
  const passwordAuthEnabled = config.features?.enablePasswordAuth !== false &&
    config.features?.passwordAuthPolicy !== 'DISABLED'
  
  // Check if we're in development environment
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Create providers based on configuration
  const providers = enabledProviders
    .filter(providerConfig => {
      // Filter out credentials provider if password auth is disabled
      if (providerConfig.type === 'credentials') {
        if (!passwordAuthEnabled) return false 
        
        // Check if it's development-only
        if (config.features?.passwordAuthPolicy === 'DEVELOPMENT_ONLY' && !isDevelopment) {
          return false
        }
      }
      return true
    })
    .map(providerConfig => {
      if (providerConfig.type === 'credentials') {
        return createCredentialsProvider(config)
      } else {
        return createOAuth2Provider(providerConfig, config)
      }
    })

  return {
    providers,
    
    session: {
      strategy: config.session?.strategy || 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },

    callbacks: {
      async jwt({ token, user, account }) {
        // Initial sign in
        if (account && user) {
          console.log('JWT callback - account provider:', account.provider)
          console.log('JWT callback - account:', account)
          if (account.provider === 'credentials') {
            // Credentials provider - token is already included
            token.id = user.id
            token.accessToken = (user as any).accessToken
            token.name = user.name
            token.email = user.email
            token.picture = user.image
            
            // Set token expiration (default 24 hours)
            token.accessTokenExpires = Date.now() + (24 * 60 * 60 * 1000)
          } else {
            // OAuth2 provider - exchange for server JWT
            console.log('Attempting to exchange OAuth2 token for server JWT')
            const serverAuth = await exchangeOAuth2Token(
              account.provider,
              account.access_token!,
              config
            )
            
            console.log('Server auth response:', serverAuth)
            
            if (serverAuth) {
              console.log('Using server JWT token')
              token.id = serverAuth.user.id
              token.accessToken = serverAuth.token
              token.name = serverAuth.user.name
              token.email = serverAuth.user.email
              token.picture = serverAuth.user.image
              
              // Set token expiration
              token.accessTokenExpires = Date.now() + (24 * 60 * 60 * 1000)
            } else {
              // Fallback to OAuth token
              console.log('Falling back to OAuth token')
              token.id = user.id
              token.accessToken = account.access_token
              token.refreshToken = account.refresh_token
              token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined
            }
          }
        }

        // Return previous token if the access token has not expired yet
        if (Date.now() < (token.accessTokenExpires as number)) {
          return token
        }

        // Access token has expired, try to update it
        return token
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.name = token.name as string
          session.user.email = token.email as string
          session.user.image = token.picture as string
          session.accessToken = token.accessToken as string
        }
        
        if (token.error) {
          session.error = token.error as string
        }
        
        return session
      },

      async signIn({ user, account }) {
        // Call custom callback if provided
        if (config.callbacks?.onSignIn) {
          await config.callbacks.onSignIn(user)
        }
        return true
      },

      async redirect({ url, baseUrl }) {
        // Allow relative callback URLs
        if (url.startsWith('/')) return `${baseUrl}${url}`
        // Allow callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        return baseUrl
      },
    },

    pages: config.pages,

    jwt: {
      secret: config.jwt?.secret || process.env.NEXTAUTH_SECRET,
      maxAge: config.jwt?.maxAge || 30 * 24 * 60 * 60, // 30 days
    },

    debug: process.env.NODE_ENV === 'development',
  }
}

/**
 * Exchange OAuth2 token for server JWT
 */
async function exchangeOAuth2Token(
  provider: string,
  oauthToken: string,
  config: AuthConfig
): Promise<AuthResponse | null> {
  const oauth2CallbackUrl = config.apiEndpoints.oauth2Callback || `/api/auth/${provider}`
  const url = `${config.apiEndpoints.baseUrl}${oauth2CallbackUrl}`

  console.log('Exchanging OAuth2 token:')
  console.log('- Provider:', provider)
  console.log('- URL:', url)
  console.log('- OAuth token present:', !!oauthToken)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken: oauthToken }),
    })

    console.log('Exchange response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to exchange OAuth2 token:', response.status, errorText)
      return null
    }

    const result = await response.json()
    console.log('Exchange successful, received token:', !!result.token)
    return result
  } catch (error) {
    console.error('Error exchanging OAuth2 token:', error)
    return null
  }
}

/**
 * Refresh expired access token
 */
async function refreshAccessToken(token: any, config: AuthConfig): Promise<any> {
  const refreshUrl = config.apiEndpoints.refresh || '/api/auth/refresh'
  const url = `${config.apiEndpoints.baseUrl}${refreshUrl}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const refreshedTokens: AuthResponse = await response.json()

    return {
      ...token,
      accessToken: refreshedTokens.token,
      accessTokenExpires: Date.now() + (24 * 60 * 60 * 1000),
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}