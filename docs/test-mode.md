# Test Mode

개발 및 테스트 환경에서 편리한 인증을 위한 테스트 모드 기능입니다.

## 기능 개요

테스트 모드는 개발 환경에서만 활성화되며, 다음 기능을 제공합니다:

- **자동 입력**: 테스트 계정 정보를 자동으로 폼에 채움
- **빠른 로그인**: 원클릭으로 테스트 계정에 로그인
- **다중 테스트 계정**: 여러 테스트 계정 지원 (역할별, 권한별)
- **환경 변수 연동**: 환경 변수를 통한 테스트 계정 설정

## 설정 방법

### 1. 기본 설정

```typescript
import { buildAuthConfig } from 'sp-nextauth-jwt-lib'

const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: true,
    testMode: {
      enabled: true,
      autoFill: true,
      quickLogin: true,
      testUsers: [
        {
          id: 'admin-user',
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin123',
          role: 'admin'
        },
        {
          id: 'normal-user',
          name: 'Normal User',
          email: 'user@test.com',
          password: 'user123',
          role: 'user'
        }
      ]
    }
  }
})
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정:

```bash
# 테스트 모드 활성화
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true

# 단일 테스트 계정
TEST_USER_EMAIL=dev@test.com
TEST_USER_PASSWORD=test123
TEST_USER_NAME=Dev User

# 다중 테스트 계정 (JSON 형식)
TEST_USERS={"admin":{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"},"user":{"name":"Normal User","email":"user@test.com","password":"user123","role":"user"},"guest":{"name":"Guest User","email":"guest@test.com","password":"guest123","role":"guest"}}
```

## 테스트 모드 옵션

### TestModeConfig 인터페이스

```typescript
interface TestModeConfig {
  enabled?: boolean      // 테스트 모드 활성화 여부
  autoFill?: boolean     // 자동 입력 활성화 (기본: true)
  quickLogin?: boolean   // 빠른 로그인 버튼 표시 (기본: false)
  testUsers?: TestUser[] // 테스트 계정 목록
}

interface TestUser {
  id: string       // 고유 식별자
  name: string     // 표시 이름
  email: string    // 이메일 주소
  password: string // 비밀번호
  role?: string    // 역할 (선택사항)
}
```

### 옵션 설명

- **enabled**: 테스트 모드 활성화 여부. `false`로 설정하면 환경 변수가 설정되어 있어도 비활성화
- **autoFill**: 첫 번째 테스트 계정의 정보를 자동으로 로그인 폼에 입력
- **quickLogin**: 테스트 계정별 원클릭 로그인 버튼 패널 표시
- **testUsers**: 사용할 테스트 계정 목록

## 사용 방법

### 1. 기본 사용 (자동 입력만)

```typescript
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    testMode: {
      enabled: true,
      autoFill: true
    }
  }
})
```

이 경우 환경 변수의 테스트 계정 정보가 자동으로 폼에 입력됩니다.

### 2. 빠른 로그인 사용

```typescript
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    testMode: {
      enabled: true,
      quickLogin: true,
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
```

로그인 폼 위에 테스트 계정별 버튼이 표시되어 원클릭 로그인이 가능합니다.

### 3. 환경 변수만 사용

```typescript
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    testMode: {
      enabled: true,
      autoFill: true,
      quickLogin: true
    }
  }
})
```

`.env.local`에 설정된 `TEST_USERS` 환경 변수의 계정들이 사용됩니다.

## UI 컴포넌트

### SignInForm 자동 통합

`SignInForm` 컴포넌트는 테스트 모드가 활성화되면 자동으로:

1. **테스트 패널 표시**: 빠른 로그인 버튼들이 표시됨
2. **자동 입력**: 첫 번째 테스트 계정 정보가 폼에 자동 입력됨
3. **DEV 배지**: 개발 환경임을 알리는 시각적 표시

### TestModePanel 독립 사용

테스트 패널을 독립적으로 사용할 수도 있습니다:

```tsx
import { TestModePanel } from 'sp-nextauth-jwt-lib'

function CustomLoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <TestModePanel
        testMode={{
          enabled: true,
          quickLogin: true,
          testUsers: [...]
        }}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Test login successful')}
        onError={(error) => console.error('Test login failed:', error)}
      />
      {/* 기타 로그인 폼 */}
    </div>
  )
}
```

## 보안 고려사항

### 1. 환경 제한
- 테스트 모드는 `NODE_ENV=development`일 때만 활성화
- 프로덕션 환경에서는 설정이 있어도 자동으로 비활성화

### 2. 환경 변수 설정
- 테스트 계정 정보는 `.env.local`에만 설정
- `.env.local`은 Git에 커밋하지 않도록 `.gitignore`에 포함

### 3. 빌드 최적화
- 프로덕션 빌드 시 테스트 모드 코드는 번들에서 제외
- 트리 쉐이킹으로 불필요한 코드 제거

## 환경 변수 우선순위

테스트 계정 정보는 다음 순서로 병합됩니다:

1. **구성 파일의 testUsers** (가장 높은 우선순위)
2. **환경 변수 TEST_USERS** (JSON 형식)
3. **개별 환경 변수** (TEST_USER_EMAIL, TEST_USER_PASSWORD 등)

같은 이메일 주소를 가진 계정이 여러 곳에 정의된 경우, 우선순위가 높은 것이 사용됩니다.

## 예제 시나리오

### 시나리오 1: 역할별 테스트
```javascript
// 관리자, 일반 사용자, 게스트별로 다른 권한 테스트
const testUsers = [
  { id: 'admin', name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
  { id: 'user', name: 'User', email: 'user@test.com', password: 'user123', role: 'user' },
  { id: 'guest', name: 'Guest', email: 'guest@test.com', password: 'guest123', role: 'guest' }
]
```

### 시나리오 2: 기능별 테스트
```javascript
// 다양한 기능 테스트를 위한 특수 계정
const testUsers = [
  { id: 'premium', name: 'Premium User', email: 'premium@test.com', password: 'premium123', role: 'premium' },
  { id: 'trial', name: 'Trial User', email: 'trial@test.com', password: 'trial123', role: 'trial' },
  { id: 'expired', name: 'Expired User', email: 'expired@test.com', password: 'expired123', role: 'expired' }
]
```

### 시나리오 3: 환경 변수만 사용
```bash
# CI/CD 파이프라인에서 동적으로 설정
TEST_USERS='{"tester1":{"name":"Tester 1","email":"tester1@ci.com","password":"ci123"},"tester2":{"name":"Tester 2","email":"tester2@ci.com","password":"ci456"}}'
```

## 문제 해결

### 테스트 모드가 활성화되지 않음
1. `NODE_ENV=development` 확인
2. `NEXT_PUBLIC_TEST_MODE=true` 설정 확인
3. `testMode.enabled: true` 설정 확인

### 테스트 계정이 표시되지 않음
1. 환경 변수 `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` 확인
2. `TEST_USERS` JSON 형식 확인
3. `testUsers` 배열에 유효한 계정 정보 확인

### 자동 입력이 동작하지 않음
1. `autoFill: true` 설정 확인
2. 첫 번째 테스트 계정의 이메일/비밀번호 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 빠른 로그인이 표시되지 않음
1. `quickLogin: true` 설정 확인
2. 유효한 테스트 계정 목록 확인
3. CSS 스타일 충돌 확인