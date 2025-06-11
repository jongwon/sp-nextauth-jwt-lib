# NextAuth JWT Library

A reusable authentication library for Next.js applications using NextAuth.js with JWT integration.

## Features

- 🔐 JWT-based authentication
- 🌐 OAuth2 providers (Kakao, Google, Naver)
- 📧 Email/password authentication
- 🔄 Automatic token refresh
- 🎣 React hooks for authentication
- 📡 Authenticated API client
- 🎨 TypeScript support

## Installation

```bash
npm install nextauth-jwt-lib
# or
yarn add nextauth-jwt-lib
```

## Quick Start

### 1. Create NextAuth Configuration

Create `pages/api/auth/[...nextauth].ts` or `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { createAuthConfig } from 'nextauth-jwt-lib'

const authConfig = createAuthConfig({
  apiEndpoints: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    signin: '/api/auth/signin',
    signup: '/api/auth/signup',
    refresh: '/api/auth/refresh',
    oauth2Callback: '/api/auth/oauth2',
  },
  providers: [
    {
      type: 'credentials',
      name: 'email-password',
    },
    {
      type: 'oauth2',
      name: 'kakao',
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    },
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
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

# OAuth2 Providers
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
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

### 4. Use Authentication in Components

```tsx
import { useAuthSession } from 'nextauth-jwt-lib'
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

### 5. Make Authenticated API Calls

```tsx
import { useAuthenticatedFetch } from 'nextauth-jwt-lib'

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

## Advanced Usage

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
import { createApiClient } from 'nextauth-jwt-lib'

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

### createAuthConfig(config)

Creates a NextAuth configuration object.

#### Parameters

- `config: AuthConfig` - Authentication configuration
  - `apiEndpoints` - Backend API endpoints
  - `providers` - Authentication providers
  - `callbacks?` - Optional callbacks
  - `pages?` - Custom pages
  - `session?` - Session configuration
  - `jwt?` - JWT configuration

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

## TypeScript Support

This library is written in TypeScript and provides full type definitions.

```typescript
import type { AuthConfig, AuthUser, SignInCredentials } from 'nextauth-jwt-lib'
```

## License

MIT