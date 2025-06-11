import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import type { AuthConfig, ProviderConfig } from '../types'

/**
 * Factory for creating OAuth2 providers
 */
export function createOAuth2Provider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  switch (providerConfig.name.toLowerCase()) {
    case 'kakao':
      return createKakaoProvider(providerConfig, authConfig)
    case 'google':
      return createGoogleProvider(providerConfig, authConfig)
    case 'naver':
      return createNaverProvider(providerConfig, authConfig)
    default:
      return createGenericOAuth2Provider(providerConfig, authConfig)
  }
}

/**
 * Kakao OAuth2 provider
 */
function createKakaoProvider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: 'kakao',
    name: 'Kakao',
    type: 'oauth',
    authorization: 'https://kauth.kakao.com/oauth/authorize',
    token: 'https://kauth.kakao.com/oauth/token',
    userinfo: 'https://kapi.kakao.com/v2/user/me',
    client: {
      client_id: providerConfig.clientId!,
      client_secret: providerConfig.clientSecret!,
    },
    checks: ['state'],
    profile(profile) {
      return {
        id: String(profile.id),
        name: profile.properties?.nickname,
        email: profile.kakao_account?.email,
        image: profile.properties?.profile_image,
      }
    },
  }
}

/**
 * Google OAuth2 provider
 */
function createGoogleProvider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    authorization: {
      url: 'https://accounts.google.com/o/oauth2/v2/auth',
      params: {
        scope: providerConfig.scope || 'openid email profile',
      },
    },
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://www.googleapis.com/oauth2/v1/userinfo',
    client: {
      client_id: providerConfig.clientId!,
      client_secret: providerConfig.clientSecret!,
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
  }
}

/**
 * Naver OAuth2 provider
 */
function createNaverProvider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: 'naver',
    name: 'Naver',
    type: 'oauth',
    authorization: 'https://nid.naver.com/oauth2.0/authorize',
    token: 'https://nid.naver.com/oauth2.0/token',
    userinfo: 'https://openapi.naver.com/v1/nid/me',
    client: {
      client_id: providerConfig.clientId!,
      client_secret: providerConfig.clientSecret!,
    },
    profile(profile) {
      return {
        id: profile.response.id,
        name: profile.response.name,
        email: profile.response.email,
        image: profile.response.profile_image,
      }
    },
  }
}

/**
 * Generic OAuth2 provider for custom implementations
 */
function createGenericOAuth2Provider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: providerConfig.id || providerConfig.name.toLowerCase(),
    name: providerConfig.name,
    type: 'oauth',
    authorization: providerConfig.authorizationUrl!,
    token: providerConfig.tokenUrl!,
    userinfo: providerConfig.userInfoUrl!,
    client: {
      client_id: providerConfig.clientId!,
      client_secret: providerConfig.clientSecret!,
    },
    profile(profile) {
      // Generic profile mapping - customize as needed
      return {
        id: profile.id || profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.image || profile.picture || profile.avatar_url,
      }
    },
  }
}