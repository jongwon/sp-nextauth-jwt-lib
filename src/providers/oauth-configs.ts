import type { OAuthProviderType, ProviderConfig } from '../types'

/**
 * Default OAuth provider configurations
 */
export const oauthProviderConfigs: Record<OAuthProviderType, Omit<ProviderConfig, 'clientId' | 'clientSecret'>> = {
  google: {
    type: 'oauth2',
    id: 'google',
    name: 'Google',
    scope: 'openid email profile',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    style: {
      logo: 'https://authjs.dev/img/providers/google.svg',
      bg: '#fff',
      bgDark: '#000',
      text: '#000',
      textDark: '#fff'
    }
  },
  
  facebook: {
    type: 'oauth2',
    id: 'facebook',
    name: 'Facebook',
    scope: 'email public_profile',
    authorizationUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    style: {
      logo: 'https://authjs.dev/img/providers/facebook.svg',
      bg: '#1877F2',
      bgDark: '#1877F2',
      text: '#fff',
      textDark: '#fff'
    }
  },
  
  github: {
    type: 'oauth2',
    id: 'github',
    name: 'GitHub',
    scope: 'read:user user:email',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    style: {
      logo: 'https://authjs.dev/img/providers/github.svg',
      logoDark: 'https://authjs.dev/img/providers/github-dark.svg',
      bg: '#000',
      bgDark: '#fff',
      text: '#fff',
      textDark: '#000'
    }
  },
  
  kakao: {
    type: 'oauth2',
    id: 'kakao',
    name: 'Kakao',
    scope: 'profile_nickname account_email',
    authorizationUrl: 'https://kauth.kakao.com/oauth/authorize',
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
    style: {
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDNDNi40NzcgMyAyIDYuNjQ0IDIgMTEuMjA0QzIgMTQuMjI2IDMuODk3IDE2Ljg0MyA2LjY3NCAxOC4yODdMNS42ODUgMjEuNjI5QzUuNjMgMjEuODAzIDUuNzI3IDIxLjk4OSA1LjkwNyAyMi4wNDFDNS45NDggMjIuMDUzIDUuOTkgMjIuMDU5IDYuMDMyIDIyLjA1OUM2LjE0MSAyMi4wNTkgNi4yNDcgMjIuMDE1IDYuMzI2IDIxLjkzN0w5Ljg1NSAyMC4xNDlDMTAuNTU4IDIwLjI0NCAxMS4yNzQgMjAuMjkxIDEyIDIwLjI5MUMxNy41MjMgMjAuMjkxIDIyIDE2LjY0NyAyMiAxMi4wODdDMjIgNy41MjcgMTcuNTIzIDMgMTIgM1oiIGZpbGw9IiMzQzFFMUUiLz4KPC9zdmc+',
      bg: '#FEE500',
      bgDark: '#FEE500',
      text: '#000',
      textDark: '#000'
    }
  },
  
  naver: {
    type: 'oauth2',
    id: 'naver',
    name: 'Naver',
    scope: 'name email',
    authorizationUrl: 'https://nid.naver.com/oauth2.0/authorize',
    tokenUrl: 'https://nid.naver.com/oauth2.0/token',
    userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
    style: {
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2LjI3MyA1LjQyODU3VjEyLjM2NTdMMTIuNjU2IDUuNDI4NTdIOC4yNDM5NFYxOC41NzE0SDExLjcyNjFWMTEuNjM0M0wxNS4zNDMzIDE4LjU3MTRIMTkuNzU1MVY1LjQyODU3SDE2LjI3M1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
      bg: '#03C75A',
      bgDark: '#03C75A',
      text: '#fff',
      textDark: '#fff'
    }
  }
}

/**
 * Get OAuth provider configuration by type
 */
export function getOAuthProviderConfig(
  type: OAuthProviderType,
  clientId?: string,
  clientSecret?: string
): ProviderConfig | null {
  const baseConfig = oauthProviderConfigs[type]
  
  if (!baseConfig) {
    return null
  }
  
  return {
    ...baseConfig,
    clientId: clientId || process.env[`NEXT_PUBLIC_${type.toUpperCase()}_CLIENT_ID`],
    clientSecret: clientSecret || process.env[`${type.toUpperCase()}_CLIENT_SECRET`],
    enabled: true
  }
}

/**
 * Create OAuth providers based on configuration
 */
export function createOAuthProviders(
  enabledProviders?: OAuthProviderType[],
  providerOverrides?: Partial<Record<OAuthProviderType, Partial<ProviderConfig>>>
): ProviderConfig[] {
  if (!enabledProviders || enabledProviders.length === 0) {
    return []
  }
  
  return enabledProviders
    .map(providerType => {
      const config = getOAuthProviderConfig(providerType)
      if (!config) return null
      
      // Apply overrides if provided
      const overrides = providerOverrides?.[providerType]
      if (overrides) {
        return { ...config, ...overrides }
      }
      
      return config
    })
    .filter((config): config is ProviderConfig => config !== null && !!config.clientId)
}