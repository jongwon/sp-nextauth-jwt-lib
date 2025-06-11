import { Session as NextAuthSession, User as NextAuthUser } from 'next-auth'
import { JWT as NextAuthJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    accessToken?: string
    error?: string
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
  }
}

export interface AuthConfig {
  apiEndpoints: {
    baseUrl: string
    signin?: string
    signup?: string
    refresh?: string
    signout?: string
    oauth2Callback?: string
    userInfo?: string
  }
  providers: ProviderConfig[]
  callbacks?: AuthCallbacks
  pages?: AuthPages
  session?: SessionConfig
  jwt?: JWTConfig
  features?: AuthFeatures
}

export interface AuthFeatures {
  enablePasswordAuth?: boolean
  passwordAuthPolicy?: 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'
  allowedEmailDomains?: string[]
  enabledOAuthProviders?: OAuthProviderType[]
}

export type OAuthProviderType = 'google' | 'facebook' | 'github' | 'kakao' | 'naver'

export interface ProviderConfig {
  type: 'credentials' | 'oauth2'
  name: string
  id?: string
  enabled?: boolean
  clientId?: string
  clientSecret?: string
  scope?: string | string[]
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  style?: OAuthProviderStyle
}

export interface OAuthProviderStyle {
  logo?: string
  logoDark?: string
  bg?: string
  bgDark?: string
  text?: string
  textDark?: string
}

export interface AuthCallbacks {
  onSignIn?: (user: any) => void | Promise<void>
  onSignOut?: () => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
}

export interface AuthPages {
  signIn?: string
  signOut?: string
  error?: string
  verifyRequest?: string
  newUser?: string
}

export interface SessionConfig {
  strategy?: 'jwt' | 'database'
  maxAge?: number
  updateAge?: number
}

export interface JWTConfig {
  secret?: string
  encryption?: boolean
  maxAge?: number
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email?: string
    name?: string
    image?: string
  }
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  name: string
}