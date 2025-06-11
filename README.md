# SP NextAuth JWT Library

🔐 Next.js 애플리케이션을 위한 완벽한 인증 솔루션. NextAuth.js와 JWT 기반 백엔드를 연결하는 프로덕션 준비 완료 라이브러리입니다.

## 🌟 주요 기능

- **🔑 다양한 인증 방법**: OAuth2 (Google, Facebook, GitHub, Kakao, Naver) + 이메일/비밀번호
- **🛡️ JWT 토큰 관리**: 자동 갱신, 만료 처리, 안전한 저장
- **⚡ 즉시 사용 가능한 컴포넌트**: 로그인/회원가입 폼, OAuth 버튼
- **🎯 TypeScript 완벽 지원**: 타입 안전성 보장
- **🧪 개발자 친화적**: 테스트 모드, 빠른 로그인, 자동 입력
- **🔧 유연한 구성**: 환경별 정책, 도메인 제한, 커스텀 프로바이더

## 📦 설치

```bash
npm install sp-nextauth-jwt-lib
# 또는
yarn add sp-nextauth-jwt-lib
# 또는
pnpm add sp-nextauth-jwt-lib
```

## 🚀 빠른 시작

### 1. 백엔드 요구사항

이 라이브러리는 다음 엔드포인트를 제공하는 JWT 기반 백엔드가 필요합니다:

```
POST /api/auth/signin     # 로그인 (email, password) → { token, user }
POST /api/auth/signup     # 회원가입 (name, email, password) → { token, user }
POST /api/auth/signout    # 로그아웃 (Authorization: Bearer token)
GET  /api/auth/me         # 사용자 정보 (Authorization: Bearer token) → { user }
POST /api/auth/kakao      # Kakao OAuth (accessToken) → { token, user }
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 추가하세요:

```bash
# 필수
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here  # openssl rand -base64 32
NEXT_PUBLIC_API_URL=http://localhost:8080

# OAuth 프로바이더 (사용하는 것만 추가)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 개발용 테스트 계정 (선택사항)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123
```

### 3. NextAuth 설정

#### App Router (권장)

`app/api/auth/[...nextauth]/route.ts` 파일을 생성하세요:

```typescript
import NextAuth from 'next-auth'
import { buildAuthConfig } from 'sp-nextauth-jwt-lib'

const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    // 이메일/비밀번호 인증 설정
    enablePasswordAuth: true,
    passwordAuthPolicy: 'ALLOW_ALL', // 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'
    
    // OAuth 프로바이더 설정
    enabledOAuthProviders: ['kakao', 'google', 'github'],
    
    // 이메일 도메인 제한 (선택사항)
    allowedEmailDomains: ['company.com', 'partner.com'],
    
    // 개발 모드 (개발 환경에서만)
    testMode: {
      enabled: process.env.NODE_ENV === 'development',
      autoFill: true,
      quickLogin: true,
    }
  },
  oauthProviders: {
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  // 백엔드 API 엔드포인트 커스터마이징 (선택사항)
  apiEndpoints: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
    exchangeOAuth2Token: '/api/auth/kakao', // OAuth 프로바이더별로 다를 수 있음
    me: '/api/auth/me'
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  }
})

const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
```

#### Pages Router

`pages/api/auth/[...nextauth].ts` 파일을 생성하세요:

```typescript
import NextAuth from 'next-auth'
import { buildAuthConfig } from 'sp-nextauth-jwt-lib'

// 위와 동일한 설정
const authConfig = buildAuthConfig({...})

export default NextAuth(authConfig)
```

### 4. SessionProvider 설정

#### App Router

`app/providers.tsx` 파일을 생성하세요:

```tsx
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

`app/layout.tsx`에서 사용하세요:

```tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### Pages Router

`pages/_app.tsx`에서 설정하세요:

```tsx
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

## 📖 사용 가이드

### 로그인 페이지

```tsx
'use client'

import { SignInForm } from 'sp-nextauth-jwt-lib'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      
      <SignInForm
        features={{
          enablePasswordAuth: true,
          passwordAuthPolicy: 'ALLOW_ALL',
          enabledOAuthProviders: ['kakao', 'google', 'github'],
        }}
        callbackUrl="/dashboard"
        onSuccess={() => {
          // 로그인 성공 처리
          router.push('/dashboard')
        }}
        onError={(error) => {
          // 에러 처리
          console.error('로그인 실패:', error)
        }}
      />
    </div>
  )
}
```

### 회원가입 페이지

```tsx
'use client'

import { SignUpForm } from 'sp-nextauth-jwt-lib'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      
      <SignUpForm
        features={{
          enablePasswordAuth: true,
          enabledOAuthProviders: ['kakao', 'google'],
          allowedEmailDomains: ['company.com'], // 특정 도메인만 허용
        }}
        callbackUrl="/onboarding"
        onSuccess={() => {
          router.push('/onboarding')
        }}
        onError={(error) => {
          alert(error.message)
        }}
      />
    </div>
  )
}
```

### 인증 상태 확인

```tsx
'use client'

import { useAuthSession } from 'sp-nextauth-jwt-lib'
import { signOut } from 'next-auth/react'

export function UserProfile() {
  const { user, isAuthenticated, isLoading, accessToken } = useAuthSession()

  if (isLoading) return <div>로딩 중...</div>
  
  if (!isAuthenticated) return <div>로그인이 필요합니다</div>

  return (
    <div>
      <p>안녕하세요, {user?.name}님!</p>
      <p>이메일: {user?.email}</p>
      <button onClick={() => signOut()}>로그아웃</button>
    </div>
  )
}
```

### API 호출

```tsx
'use client'

import { useAuthenticatedFetch } from 'sp-nextauth-jwt-lib'
import { useEffect, useState } from 'react'

export function TodoList() {
  const { apiClient, isAuthenticated } = useAuthenticatedFetch(
    process.env.NEXT_PUBLIC_API_URL!
  )
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (apiClient && isAuthenticated) {
      // 자동으로 Authorization 헤더가 추가됩니다
      apiClient.get('/api/todos')
        .then(setTodos)
        .catch(console.error)
    }
  }, [apiClient, isAuthenticated])

  const createTodo = async (title: string) => {
    if (!apiClient) return
    
    try {
      const newTodo = await apiClient.post('/api/todos', { title })
      setTodos([...todos, newTodo])
    } catch (error) {
      console.error('Todo 생성 실패:', error)
    }
  }

  return (
    <div>
      {/* Todo 리스트 UI */}
    </div>
  )
}
```

### 서버 사이드 인증

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getServerSideProps(context) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  )

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // 백엔드 API 호출 시 토큰 사용
  const response = await fetch('http://backend/api/protected', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  return {
    props: {
      data: await response.json(),
    },
  }
}
```

## 🎨 컴포넌트 커스터마이징

### 스타일 커스터마이징

모든 컴포넌트는 `className` prop을 지원합니다:

```tsx
<SignInForm
  className="custom-form"
  features={{...}}
/>

<OAuthButton
  provider="google"
  className="custom-oauth-button"
>
  Google로 계속하기
</OAuthButton>
```

### 커스텀 OAuth 프로바이더

```typescript
const authConfig = createAuthConfig({
  providers: [
    // 기본 프로바이더
    ...getDefaultProviders(config),
    
    // 커스텀 프로바이더 추가
    {
      id: 'custom-oauth',
      name: 'Custom Provider',
      type: 'oauth',
      authorization: {
        url: 'https://provider.com/oauth/authorize',
        params: {
          scope: 'read:user',
        },
      },
      token: 'https://provider.com/oauth/token',
      userinfo: 'https://provider.com/api/user',
      clientId: process.env.CUSTOM_CLIENT_ID!,
      clientSecret: process.env.CUSTOM_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        }
      },
    },
  ],
})
```

## 🧪 개발 모드

개발 환경에서 테스트를 쉽게 하기 위한 기능들:

### 테스트 모드 설정

```typescript
const authConfig = buildAuthConfig({
  features: {
    testMode: {
      enabled: true,
      autoFill: true,      // 로그인 폼 자동 채우기
      quickLogin: true,    // 빠른 로그인 버튼 표시
      testUsers: [
        {
          id: '1',
          name: '관리자',
          email: 'admin@test.com',
          password: 'admin123',
          role: 'admin'
        },
        {
          id: '2',
          name: '일반 사용자',
          email: 'user@test.com',
          password: 'user123',
          role: 'user'
        }
      ]
    }
  }
})
```

### 환경 변수로 테스트 계정 설정

```bash
# .env.local
NEXT_PUBLIC_TEST_MODE=true
TEST_USER_EMAIL=dev@test.com
TEST_USER_PASSWORD=dev123
```

## 🔧 고급 설정

### 인증 정책

```typescript
// 개발 환경에서만 비밀번호 인증 허용
passwordAuthPolicy: 'DEVELOPMENT_ONLY'

// 특정 도메인만 허용
allowedEmailDomains: ['company.com', 'partner.com']

// OAuth 프로바이더 동적 활성화
enabledOAuthProviders: process.env.NODE_ENV === 'production' 
  ? ['google', 'github'] 
  : ['google', 'github', 'kakao', 'naver', 'facebook']
```

### 콜백 커스터마이징

```typescript
const authConfig = createAuthConfig({
  // ... 기본 설정
  callbacks: {
    async jwt({ token, user, account }) {
      // 커스텀 JWT 로직
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      // 커스텀 세션 로직
      session.user.role = token.role
      session.user.permissions = token.permissions
      return session
    },
  },
})
```

## 📋 API 레퍼런스

### Hooks

#### `useAuthSession()`
인증 세션 정보와 상태를 제공합니다.

```typescript
const {
  session,        // NextAuth 세션 객체
  status,         // 'loading' | 'authenticated' | 'unauthenticated'
  isAuthenticated,// boolean
  isLoading,      // boolean
  user,           // 사용자 정보
  accessToken,    // JWT 토큰
} = useAuthSession()
```

#### `useAuthenticatedFetch(baseUrl)`
인증된 API 클라이언트를 제공합니다.

```typescript
const {
  apiClient,      // API 클라이언트 인스턴스
  isAuthenticated,// boolean
  accessToken,    // JWT 토큰
} = useAuthenticatedFetch('https://api.example.com')
```

### Components

#### `SignInForm`
```typescript
interface SignInFormProps {
  features?: AuthFeatures
  callbackUrl?: string
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}
```

#### `SignUpForm`
```typescript
interface SignUpFormProps {
  features?: AuthFeatures
  callbackUrl?: string
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  signUpEndpoint?: string
}
```

#### `OAuthButton`
```typescript
interface OAuthButtonProps {
  provider: OAuthProviderType
  callbackUrl?: string
  className?: string
  children?: React.ReactNode
}
```

### Types

```typescript
type OAuthProviderType = 'google' | 'facebook' | 'github' | 'kakao' | 'naver'

type PasswordAuthPolicy = 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'

interface AuthFeatures {
  enablePasswordAuth?: boolean
  passwordAuthPolicy?: PasswordAuthPolicy
  allowedEmailDomains?: string[]
  enabledOAuthProviders?: OAuthProviderType[]
  testMode?: TestModeConfig
}
```

## 🐛 문제 해결

### 일반적인 문제

#### 1. "NEXTAUTH_SECRET is not set" 에러
```bash
# .env.local에 추가
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### 2. OAuth 리다이렉트 URL 에러
OAuth 프로바이더 설정에서 다음 URL을 허용하세요:
- 개발: `http://localhost:3000/api/auth/callback/{provider}`
- 프로덕션: `https://yourdomain.com/api/auth/callback/{provider}`

#### 3. CORS 에러
백엔드에서 프론트엔드 도메인을 CORS 허용 목록에 추가하세요.

### 디버깅

```typescript
// 디버그 모드 활성화
const authConfig = buildAuthConfig({
  // ... 설정
  debug: process.env.NODE_ENV === 'development',
})
```

## 📄 라이선스

MIT License

## 🤝 기여하기

기여는 언제나 환영합니다! 이슈를 생성하거나 PR을 제출해주세요.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

- 📧 이메일: support@example.com
- 💬 Discord: [커뮤니티 참여](https://discord.gg/example)
- 📚 문서: [상세 문서](https://docs.example.com)

---

Made with ❤️ by SP Team