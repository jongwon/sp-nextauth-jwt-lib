# SP NextAuth JWT Library

A reusable authentication library for Next.js applications using NextAuth.js with JWT integration and configurable authentication methods.

## Features

- 🔐 JWT-based authentication
- 🌐 Multiple OAuth2 providers (Google, Facebook, GitHub, Kakao, Naver)
- 📧 Configurable email/password authentication
- 🔄 Automatic token refresh
- 🎣 React hooks for authentication
- 📡 Authenticated API client
- 🎨 TypeScript support
- ⚙️ Flexible authentication policies
- 🎯 Domain-based access control
- 🖼️ Pre-built authentication components

## Installation

```bash
npm install sp-nextauth-jwt-lib
# or
yarn add sp-nextauth-jwt-lib
```

## Quick Start

### 1. Create NextAuth Configuration

Create `pages/api/auth/[...nextauth].ts` or `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { buildAuthConfig } from 'sp-nextauth-jwt-lib'

const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: true,
    passwordAuthPolicy: 'ALLOW_ALL', // 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'
    enabledOAuthProviders: ['google', 'github', 'kakao'],
  },
  oauthProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    },
  },
})

// For Pages Router
export default NextAuth(authConfig)

// For App Router
const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
```

### 2. Set Environment Variables

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8080

# OAuth2 Providers (only set the ones you're using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

### 3. Wrap App with SessionProvider

```tsx
// pages/_app.tsx or app/layout.tsx
import { SessionProvider } from 'next-auth/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

### 4. Use Authentication Components

```tsx
import { SignInForm, OAuthButton } from 'sp-nextauth-jwt-lib'

// Complete sign-in form with password and OAuth options
export function LoginPage() {
  return (
    <SignInForm
      features={{
        enablePasswordAuth: true,
        passwordAuthPolicy: 'ALLOW_ALL',
        enabledOAuthProviders: ['google', 'github', 'kakao'],
        allowedEmailDomains: ['company.com'], // Optional email restrictions
      }}
      callbackUrl="/dashboard"
      onSuccess={() => console.log('Login successful')}
      onError={(error) => console.error('Login failed:', error)}
    />
  )
}

// Or use individual OAuth buttons
export function SocialLogin() {
  return (
    <div>
      <OAuthButton provider="google" />
      <OAuthButton provider="github" />
      <OAuthButton provider="kakao" />
      <OAuthButton provider="facebook" />
      <OAuthButton provider="naver" />
    </div>
  )
}
```

### 5. Use Authentication in Components

```tsx
import { useAuthSession } from 'sp-nextauth-jwt-lib'
import { signIn, signOut } from 'next-auth/react'

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuthSession()

  if (isLoading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => signIn()}>
        Sign In
      </button>
    )
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  )
}
```

### 6. Make Authenticated API Calls

```tsx
import { useAuthenticatedFetch } from 'sp-nextauth-jwt-lib'

export function TodoList() {
  const { apiClient } = useAuthenticatedFetch(process.env.NEXT_PUBLIC_API_URL!)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (apiClient) {
      apiClient.get('/api/todos')
        .then(setTodos)
        .catch(console.error)
    }
  }, [apiClient])

  const createTodo = async (title: string) => {
    if (!apiClient) return
    
    const newTodo = await apiClient.post('/api/todos', { title })
    setTodos([...todos, newTodo])
  }

  return (
    // Your component UI
  )
}
```

### 6. Test Mode for Development

Enable test mode for easy development and testing:

```tsx
import { SignInForm } from 'sp-nextauth-jwt-lib'

const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: true,
    enabledOAuthProviders: ['google', 'github'],
    testMode: {
      enabled: true,
      autoFill: true,        // Auto-fill test credentials
      quickLogin: true,      // Show quick login buttons
      testUsers: [
        {
          id: 'admin',
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin123',
          role: 'admin'
        },
        {
          id: 'user',
          name: 'Normal User',
          email: 'user@test.com',
          password: 'user123',
          role: 'user'
        }
      ]
    }
  }
})

// Environment variables for test accounts
// .env.local
NEXT_PUBLIC_TEST_MODE=true
TEST_USER_EMAIL=dev@test.com
TEST_USER_PASSWORD=test123
// Or multiple test users as JSON
TEST_USERS={"admin":{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}}
```

Test mode features:
- **Auto-fill**: Automatically fills login form with test credentials
- **Quick login**: One-click login buttons for different test accounts
- **Development only**: Only works in `NODE_ENV=development`
- **Environment integration**: Load test accounts from environment variables

## Advanced Usage

### Authentication Policies

```typescript
// Disable password authentication in production
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: false, // Completely disable password auth
    enabledOAuthProviders: ['google', 'github'], // Only OAuth login
  },
})

// Allow password auth only in development
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    passwordAuthPolicy: 'DEVELOPMENT_ONLY',
    enabledOAuthProviders: ['google', 'github', 'kakao'],
  },
})

// Restrict password auth to specific email domains
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: true,
    allowedEmailDomains: ['company.com', 'partner.com'],
    enabledOAuthProviders: ['google'],
  },
})
```

### Custom Provider Configuration

```typescript
const authConfig = createAuthConfig({
  // ...
  providers: [
    {
      type: 'oauth2',
      name: 'custom-provider',
      id: 'custom',
      clientId: process.env.CUSTOM_CLIENT_ID!,
      clientSecret: process.env.CUSTOM_CLIENT_SECRET!,
      authorizationUrl: 'https://provider.com/oauth/authorize',
      tokenUrl: 'https://provider.com/oauth/token',
      userInfoUrl: 'https://provider.com/api/user',
      scope: 'read:user',
    },
  ],
})
```

### Custom Callbacks

```typescript
const authConfig = createAuthConfig({
  // ...
  callbacks: {
    onSignIn: async (user) => {
      console.log('User signed in:', user)
      // Track login event, update last login time, etc.
    },
    onSignOut: async () => {
      console.log('User signed out')
      // Clean up local data, track logout, etc.
    },
    onError: async (error) => {
      console.error('Auth error:', error)
      // Send error to monitoring service
    },
  },
})
```

### Direct API Client Usage

```typescript
import { createApiClient } from 'sp-nextauth-jwt-lib'

const api = createApiClient('https://api.example.com')

// In an authenticated context
async function fetchUserData() {
  try {
    const profile = await api.get('/api/profile')
    const posts = await api.get('/api/posts')
    return { profile, posts }
  } catch (error) {
    console.error('API error:', error)
  }
}
```

### Server-Side Authentication

```typescript
// pages/api/protected.ts or app/api/protected/route.ts
import { getServerSession } from 'next-auth'
import { authConfig } from './auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authConfig)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Use session.accessToken for backend API calls
  const response = await fetch('http://backend/api/data', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })
  
  const data = await response.json()
  res.json(data)
}
```

## API Reference

### buildAuthConfig(options)

Creates a NextAuth configuration with sensible defaults and feature flags.

#### Parameters

- `options: AuthConfigBuilderOptions`
  - `apiBaseUrl` - Base URL for backend API
  - `features?` - Authentication features configuration
    - `enablePasswordAuth?` - Enable/disable password authentication
    - `passwordAuthPolicy?` - Password auth policy ('ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED')
    - `allowedEmailDomains?` - Restrict password auth to specific domains
    - `enabledOAuthProviders?` - List of OAuth providers to enable
  - `oauthProviders?` - OAuth provider configurations
  - `jwt?` - JWT configuration
  - `pages?` - Custom page URLs

### createAuthConfig(config)

Creates a NextAuth configuration object with full control.

#### Parameters

- `config: AuthConfig` - Authentication configuration
  - `apiEndpoints` - Backend API endpoints
  - `providers` - Authentication providers
  - `callbacks?` - Optional callbacks
  - `pages?` - Custom pages
  - `session?` - Session configuration
  - `jwt?` - JWT configuration
  - `features?` - Authentication features

### useAuthSession(options?)

React hook for accessing authentication session.

#### Returns

- `session` - Current session object
- `status` - Authentication status
- `isAuthenticated` - Whether user is authenticated
- `isLoading` - Loading state
- `isExpired` - Token expiration state
- `user` - Current user object
- `accessToken` - JWT access token

### useAuthenticatedFetch(baseUrl)

React hook for making authenticated API calls.

#### Returns

- `apiClient` - Authenticated API client
- `isAuthenticated` - Authentication state
- `accessToken` - Current access token

### createApiClient(baseUrl)

Creates an API client with authentication.

#### Methods

- `get(endpoint, options?)` - GET request
- `post(endpoint, data?, options?)` - POST request
- `put(endpoint, data?, options?)` - PUT request
- `delete(endpoint, options?)` - DELETE request
- `patch(endpoint, data?, options?)` - PATCH request

### Components

#### SignInForm

Pre-built sign-in form with password and OAuth options.

```tsx
<SignInForm
  features={authFeatures}
  callbackUrl="/dashboard"
  className="custom-form"
  onSuccess={() => {}}
  onError={(error) => {}}
/>
```

#### OAuthButton

Individual OAuth provider button.

```tsx
<OAuthButton
  provider="google" // 'google' | 'facebook' | 'github' | 'kakao' | 'naver'
  callbackUrl="/dashboard"
  className="custom-button"
>
  Custom Button Text
</OAuthButton>
```

## TypeScript Support

This library is written in TypeScript and provides full type definitions.

```typescript
import type { 
  AuthConfig, 
  AuthUser, 
  SignInCredentials,
  AuthFeatures,
  OAuthProviderType 
} from 'sp-nextauth-jwt-lib'
```

## License

MIT