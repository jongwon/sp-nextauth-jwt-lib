import type { AuthConfig, AuthFeatures, OAuthProviderType, ProviderConfig } from '../types'
import { createOAuthProviders, oauthProviderConfigs } from '../providers/oauth-configs'

export interface AuthConfigBuilderOptions {
  apiBaseUrl: string
  features?: AuthFeatures
  oauthProviders?: Partial<Record<OAuthProviderType, {
    clientId?: string
    clientSecret?: string
    scope?: string | string[]
  }>>
  jwt?: {
    secret?: string
    maxAge?: number
  }
  pages?: {
    signIn?: string
    signOut?: string
    error?: string
  }
}

/**
 * Build authentication configuration with sensible defaults
 */
export function buildAuthConfig(options: AuthConfigBuilderOptions): AuthConfig {
  const {
    apiBaseUrl,
    features = {},
    oauthProviders = {},
    jwt = {},
    pages = {}
  } = options
  
  // Determine which OAuth providers are enabled
  const enabledOAuthProviders = features.enabledOAuthProviders || 
    Object.keys(oauthProviders).filter(provider => 
      oauthProviders[provider as OAuthProviderType]?.clientId
    ) as OAuthProviderType[]
  
  // Build provider configurations
  const providers: ProviderConfig[] = []
  
  // Add credentials provider if password auth is enabled
  if (features.enablePasswordAuth !== false && 
      features.passwordAuthPolicy !== 'DISABLED') {
    providers.push({
      type: 'credentials',
      name: 'Email/Password',
      id: 'credentials',
      enabled: true
    })
  }
  
  // Add OAuth providers
  const oauthConfigs = createOAuthProviders(
    enabledOAuthProviders,
    Object.entries(oauthProviders).reduce((acc, [provider, config]) => ({
      ...acc,
      [provider]: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        scope: config.scope
      }
    }), {})
  )
  
  providers.push(...oauthConfigs)
  
  return {
    apiEndpoints: {
      baseUrl: apiBaseUrl,
      signin: '/api/auth/signin',
      signup: '/api/auth/signup',
      refresh: '/api/auth/refresh',
      signout: '/api/auth/signout',
      oauth2Callback: '/api/auth/oauth2/callback',
      userInfo: '/api/auth/me'
    },
    providers,
    features,
    jwt: {
      secret: jwt.secret || process.env.NEXTAUTH_SECRET,
      maxAge: jwt.maxAge || 30 * 24 * 60 * 60
    },
    pages: {
      signIn: pages.signIn || '/auth/signin',
      signOut: pages.signOut || '/auth/signout',
      error: pages.error || '/auth/error'
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60
    }
  }
}

/**
 * Create a simple auth configuration with minimal setup
 */
export function createSimpleAuthConfig(
  apiBaseUrl: string,
  options?: {
    enablePasswordAuth?: boolean
    enabledProviders?: OAuthProviderType[]
  }
): AuthConfig {
  return buildAuthConfig({
    apiBaseUrl,
    features: {
      enablePasswordAuth: options?.enablePasswordAuth ?? true,
      enabledOAuthProviders: options?.enabledProviders || []
    }
  })
}