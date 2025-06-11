// Main configuration
export { createAuthConfig } from './config'
export { buildAuthConfig, createSimpleAuthConfig } from './config/auth-config-builder'

// Providers
export { createCredentialsProvider, createOAuth2Provider } from './providers'
export { oauthProviderConfigs, getOAuthProviderConfig, createOAuthProviders } from './providers/oauth-configs'

// Components
export * from './components'

// Hooks
export { useAuthSession, useAuthenticatedFetch } from './hooks'

// Utils
export { createAuthenticatedFetch, createApiClient } from './utils'

// Types
export * from './types'