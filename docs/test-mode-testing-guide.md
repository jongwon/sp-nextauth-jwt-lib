# Test Mode Testing Guide

본 가이드는 SP NextAuth JWT Library의 테스트 모드 기능을 실제 Next.js 프로젝트에서 검증하기 위한 단계별 테스트 절차를 제공합니다.

## 사전 준비

### 1. 테스트 환경 설정

```bash
# .env.local 파일 생성
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth 기본 설정
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 2. 프로젝트 의존성 확인

```bash
npm install sp-nextauth-jwt-lib
npm install next-auth
```

## 테스트 시나리오

### 🧪 테스트 1: 자동 입력 (Auto-fill) 기능

#### 목표
- 테스트 계정 정보가 로그인 폼에 자동으로 입력되는지 확인

#### 설정
```bash
# .env.local에 추가
TEST_USER_EMAIL=auto@test.com
TEST_USER_PASSWORD=auto123
TEST_USER_NAME=Auto Test User
```

#### 테스트 코드
```tsx
// pages/auth/signin.tsx
import { buildAuthConfig, SignInForm } from 'sp-nextauth-jwt-lib'

export default function SignInPage() {
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
    features: {
      enablePasswordAuth: true,
      testMode: {
        enabled: true,
        autoFill: true,
        quickLogin: false
      }
    }
  })

  return (
    <div>
      <h1>테스트: 자동 입력 기능</h1>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
      />
    </div>
  )
}
```

#### 검증 절차
1. 페이지 로드 시 이메일과 비밀번호 필드가 자동으로 채워지는지 확인
2. 채워진 값이 환경 변수와 일치하는지 확인
3. ✅ **통과 조건**: 폼이 자동으로 채워짐
4. ❌ **실패 조건**: 폼이 비어있거나 잘못된 값이 입력됨

---

### 🚀 테스트 2: 빠른 로그인 버튼들

#### 목표
- 각 테스트 계정별 원클릭 로그인 버튼이 정상 작동하는지 확인

#### 설정
```bash
# .env.local에 추가 (기존 설정 유지하고 추가)
TEST_USERS='{"admin":{"name":"관리자","email":"admin@test.com","password":"admin123","role":"admin"},"user":{"name":"일반 사용자","email":"user@test.com","password":"user123","role":"user"},"guest":{"name":"게스트","email":"guest@test.com","password":"guest123","role":"guest"}}'
```

#### 테스트 코드
```tsx
// pages/auth/quick-login.tsx
import { buildAuthConfig, SignInForm } from 'sp-nextauth-jwt-lib'

export default function QuickLoginPage() {
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
            id: 'config-admin',
            name: '설정 관리자',
            email: 'config-admin@test.com',
            password: 'config123',
            role: 'admin'
          }
        ]
      }
    }
  })

  return (
    <div>
      <h1>테스트: 빠른 로그인 버튼</h1>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => alert('로그인 성공!')}
        onError={(error) => alert(`로그인 실패: ${error.message}`)}
      />
    </div>
  )
}
```

#### 검증 절차
1. **테스트 패널 표시 확인**: 
   - DEV 배지와 "Quick Login" 헤더가 표시되는지 확인
   - 줄무늬 배경과 노란색 테두리가 적용되는지 확인

2. **버튼 개수 확인**:
   - 환경 변수 사용자 (3개) + 설정 사용자 (1개) = 총 4개 버튼
   - 각 버튼에 사용자 이름, 이메일, 역할이 표시되는지 확인

3. **버튼 기능 테스트**:
   - 각 버튼 클릭 시 해당 계정으로 로그인 시도
   - 성공 시 onSuccess 콜백 호출 확인
   - 실패 시 onError 콜백 호출 확인

4. ✅ **통과 조건**: 모든 버튼이 정상 작동하고 올바른 사용자로 로그인됨
5. ❌ **실패 조건**: 버튼이 표시되지 않거나 클릭해도 로그인되지 않음

---

### 🔧 테스트 3: 환경 변수 통합

#### 목표
- 다양한 환경 변수 형태가 올바르게 로드되고 병합되는지 확인

#### 테스트 3-1: 단일 사용자만 설정
```bash
# .env.local (다른 TEST_ 변수들 제거)
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true
TEST_USER_EMAIL=single@test.com
TEST_USER_PASSWORD=single123
TEST_USER_NAME=단일 사용자
```

#### 테스트 3-2: JSON 형태만 설정
```bash
# .env.local (다른 TEST_ 변수들 제거)
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true
TEST_USERS='{"dev":{"name":"개발자","email":"dev@test.com","password":"dev123","role":"developer"},"qa":{"name":"QA","email":"qa@test.com","password":"qa123","role":"tester"}}'
```

#### 테스트 3-3: 잘못된 JSON 형태
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true
TEST_USERS='invalid-json-format'
```

#### 검증 절차
1. **단일 사용자 테스트**: 1개 버튼만 표시되는지 확인
2. **JSON 사용자 테스트**: 2개 버튼(dev, qa)이 표시되는지 확인
3. **잘못된 JSON 테스트**: 오류 없이 처리되고 버튼이 표시되지 않는지 확인
4. 브라우저 콘솔에서 적절한 경고 메시지 확인

---

### 👥 테스트 4: 다중 테스트 계정 지원

#### 목표
- 설정 파일과 환경 변수의 사용자가 올바르게 병합되는지 확인
- 중복 이메일 처리가 정상적인지 확인

#### 설정
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true
TEST_USERS='{"env-admin":{"name":"환경 관리자","email":"admin@test.com","password":"env123","role":"admin"},"env-user":{"name":"환경 사용자","email":"user@env.com","password":"env456","role":"user"}}'
```

#### 테스트 코드
```tsx
// 설정에서도 같은 이메일 사용
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    testMode: {
      enabled: true,
      quickLogin: true,
      testUsers: [
        {
          id: 'config-admin',
          name: '설정 관리자',
          email: 'admin@test.com', // 환경 변수와 동일한 이메일
          password: 'config123',
          role: 'super-admin'
        },
        {
          id: 'config-unique',
          name: '설정 전용',
          email: 'config@test.com',
          password: 'config456',
          role: 'config-user'
        }
      ]
    }
  }
})
```

#### 검증 절차
1. **사용자 개수 확인**: 총 3개 버튼 표시되는지 확인
   - admin@test.com (설정 파일 우선순위로 1개만)
   - user@env.com (환경 변수에서)
   - config@test.com (설정 파일에서)

2. **우선순위 확인**: admin@test.com 사용자가 "설정 관리자"로 표시되는지 확인

3. **역할 표시 확인**: 각 사용자의 역할이 올바르게 표시되는지 확인

---

### 🔒 테스트 5: 개발 환경에서만 동작하는지 확인

#### 목표
- 프로덕션 환경에서 테스트 모드가 비활성화되는지 확인

#### 테스트 5-1: 프로덕션 환경 시뮬레이션
```bash
# .env.local
NODE_ENV=production
NEXT_PUBLIC_TEST_MODE=true
TEST_USERS='{"admin":{"name":"관리자","email":"admin@test.com","password":"admin123","role":"admin"}}'
```

#### 테스트 5-2: 환경 변수로 비활성화
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=false
TEST_USERS='{"admin":{"name":"관리자","email":"admin@test.com","password":"admin123","role":"admin"}}'
```

#### 검증 절차
1. **프로덕션 환경**: 테스트 패널이 표시되지 않는지 확인
2. **비활성화 설정**: 테스트 패널이 표시되지 않는지 확인
3. **일반 로그인 폼**: 이메일/비밀번호 필드는 정상 작동하는지 확인
4. **자동 입력 비활성화**: 필드가 자동으로 채워지지 않는지 확인

---

### 🔍 테스트 6: 추가 기능 검증

#### 6-1: 이메일 도메인 제한과 테스트 사용자
```tsx
const authConfig = buildAuthConfig({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  features: {
    enablePasswordAuth: true,
    allowedEmailDomains: ['company.com'],
    testMode: {
      enabled: true,
      autoFill: true,
      quickLogin: true,
      testUsers: [
        {
          id: 'test-outside-domain',
          name: '도메인 외부 테스트',
          email: 'test@test.com', // company.com이 아님
          password: 'test123',
          role: 'tester'
        }
      ]
    }
  }
})
```

**검증**: 
- company.com 외부 이메일 입력 시 경고 메시지 표시
- 테스트 사용자 이메일은 도메인 제한 무시하고 허용

#### 6-2: 독립적인 TestModePanel 사용
```tsx
import { TestModePanel } from 'sp-nextauth-jwt-lib'

export default function CustomLoginPage() {
  return (
    <div>
      <h1>커스텀 로그인 페이지</h1>
      <TestModePanel
        testMode={{
          enabled: true,
          quickLogin: true,
          testUsers: [
            { id: 'standalone', name: '독립 사용자', email: 'standalone@test.com', password: 'standalone123' }
          ]
        }}
        callbackUrl="/custom-dashboard"
        onSuccess={() => console.log('독립 패널 로그인 성공')}
        onError={(error) => console.error('독립 패널 로그인 실패:', error)}
      />
      {/* 여기에 커스텀 로그인 폼 추가 */}
    </div>
  )
}
```

**검증**: 독립 패널이 정상 작동하고 커스텀 콜백이 호출되는지 확인

---

## 통합 테스트 스크립트

### 자동화된 검증 스크립트 실행

```bash
# 검증 스크립트 실행 (Node.js 환경에서)
npx ts-node examples/test-mode-validation.ts
```

### 브라우저 콘솔에서 디버그 정보 확인

```javascript
// 브라우저 개발자 도구 콘솔에서 실행
import { getTestModeDebugInfo } from 'sp-nextauth-jwt-lib'

const debugInfo = getTestModeDebugInfo(yourTestModeConfig)
console.log('Test Mode Debug Info:', debugInfo)
```

---

## 예상 결과 및 문제 해결

### ✅ 성공적인 테스트 결과
1. **자동 입력**: 환경 변수 정보가 자동으로 폼에 입력됨
2. **빠른 로그인**: 모든 테스트 계정 버튼이 표시되고 정상 작동
3. **환경 변수**: 단일/복수 사용자 설정이 올바르게 로드됨
4. **다중 계정**: 설정과 환경 변수가 병합되고 중복 제거됨
5. **보안**: 프로덕션 환경에서 자동 비활성화됨

### ❌ 일반적인 문제 및 해결

#### 문제 1: 테스트 패널이 표시되지 않음
**원인**: 
- NODE_ENV가 'development'가 아님
- NEXT_PUBLIC_TEST_MODE가 'false'로 설정됨
- testMode.enabled가 false

**해결**: 환경 변수와 설정 확인

#### 문제 2: 자동 입력이 작동하지 않음
**원인**: 
- TEST_USER_EMAIL, TEST_USER_PASSWORD 누락
- autoFill이 false로 설정됨

**해결**: 환경 변수 설정 확인

#### 문제 3: JSON 파싱 오류
**원인**: TEST_USERS 환경 변수의 JSON 형식 오류

**해결**: JSON 형식 검증 (온라인 JSON validator 사용)

#### 문제 4: 중복 사용자 문제
**예상**: 같은 이메일의 사용자가 여러 개 표시됨

**확인**: 설정 파일 사용자가 환경 변수 사용자보다 우선순위가 높은지 확인

---

## 테스트 완료 체크리스트

- [ ] ✅ 자동 입력 기능이 정상 작동함
- [ ] ✅ 빠근 로그인 버튼들이 모두 표시되고 작동함
- [ ] ✅ 환경 변수에서 단일/복수 사용자가 올바르게 로드됨
- [ ] ✅ 설정과 환경 변수 사용자가 올바르게 병합됨
- [ ] ✅ 프로덕션 환경에서 테스트 모드가 비활성화됨
- [ ] ✅ 잘못된 JSON이 오류 없이 처리됨
- [ ] ✅ 이메일 도메인 제한에서 테스트 사용자가 예외 처리됨
- [ ] ✅ 독립적인 TestModePanel이 정상 작동함

모든 항목이 체크되면 테스트 모드 기능이 성공적으로 구현되었음을 의미합니다! 🎉