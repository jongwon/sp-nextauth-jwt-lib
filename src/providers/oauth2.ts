import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import type { AuthConfig, ProviderConfig } from '../types'

/**
 * Factory for creating OAuth2 providers
 */
export function createOAuth2Provider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  const providerId = providerConfig.id || providerConfig.name.toLowerCase()
  
  switch (providerId) {
    case 'kakao':
      return createKakaoProvider(providerConfig, authConfig)
    case 'google':
      return createGoogleProvider(providerConfig, authConfig)
    case 'naver':
      return createNaverProvider(providerConfig, authConfig)
    case 'facebook':
      return createFacebookProvider(providerConfig, authConfig)
    case 'github':
      return createGitHubProvider(providerConfig, authConfig)
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
    authorization: {
      url: 'https://kauth.kakao.com/oauth/authorize',
      params: {
        scope: Array.isArray(providerConfig.scope) 
          ? providerConfig.scope.join(' ') 
          : providerConfig.scope || 'profile_nickname profile_image',
      },
    },
    token: 'https://kauth.kakao.com/oauth/token',
    userinfo: 'https://kapi.kakao.com/v2/user/me',
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    checks: ['state'],
    profile(profile) {
      return {
        id: String(profile.id),
        name: profile.properties?.nickname || profile.kakao_account?.profile?.nickname,
        email: profile.kakao_account?.email,
        image: profile.properties?.profile_image || profile.kakao_account?.profile?.profile_image_url,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
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
        scope: Array.isArray(providerConfig.scope) 
          ? providerConfig.scope.join(' ') 
          : providerConfig.scope || 'openid email profile',
      },
    },
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://www.googleapis.com/oauth2/v1/userinfo',
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
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
    profile(profile) {
      return {
        id: profile.response.id,
        name: profile.response.name,
        email: profile.response.email,
        image: profile.response.profile_image,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
  }
}

/**
 * Facebook OAuth2 provider
 */
function createFacebookProvider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: 'facebook',
    name: 'Facebook',
    type: 'oauth',
    authorization: {
      url: 'https://www.facebook.com/v12.0/dialog/oauth',
      params: {
        scope: Array.isArray(providerConfig.scope) 
          ? providerConfig.scope.join(' ') 
          : providerConfig.scope || 'email public_profile',
      },
    },
    token: 'https://graph.facebook.com/v12.0/oauth/access_token',
    userinfo: 'https://graph.facebook.com/me?fields=id,name,email,picture',
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture?.data?.url,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
  }
}

/**
 * GitHub OAuth2 provider
 */
function createGitHubProvider(
  providerConfig: ProviderConfig,
  authConfig: AuthConfig
): OAuthConfig<any> {
  return {
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    authorization: {
      url: 'https://github.com/login/oauth/authorize',
      params: {
        scope: Array.isArray(providerConfig.scope) 
          ? providerConfig.scope.join(' ') 
          : providerConfig.scope || 'read:user user:email',
      },
    },
    token: 'https://github.com/login/oauth/access_token',
    userinfo: 'https://api.github.com/user',
    profile(profile) {
      return {
        id: String(profile.id),
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
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
    profile(profile) {
      // Generic profile mapping - customize as needed
      return {
        id: profile.id || profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.image || profile.picture || profile.avatar_url,
      }
    },
    clientId: providerConfig.clientId!,
    clientSecret: providerConfig.clientSecret!,
  }
}