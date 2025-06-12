// Type definitions for authentication
import { JWT as NextAuthJWT } from 'next-auth/jwt'

// Export interfaces and types that would normally be in auth.d.ts
export interface AuthFeatures {
  enablePasswordAuth?: boolean
  passwordAuthPolicy?: 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'
  allowedEmailDomains?: string[]
  enabledOAuthProviders?: OAuthProviderType[]
  testMode?: TestModeConfig
}

export type OAuthProviderType = 'google' | 'facebook' | 'github' | 'kakao' | 'naver'

export interface TestModeConfig {
  enabled?: boolean
  autoFill?: boolean
  quickLogin?: boolean
  testUsers?: TestUser[]
}

export interface TestUser {
  id: string
  name: string
  email: string
  password: string
  role?: string
}

export interface OAuthProviderStyle {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}