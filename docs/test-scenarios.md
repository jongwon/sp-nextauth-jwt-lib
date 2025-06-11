# Test Scenarios

## 개요

SP NextAuth JWT Library의 포괄적인 테스트 시나리오입니다. 실제 테스트 구현은 복잡하지만, 다음 시나리오들은 라이브러리의 모든 주요 기능과 엣지 케이스를 검증하기 위한 가이드라인을 제공합니다.

## 1. 구성(Configuration) 테스트

### 1.1 buildAuthConfig 테스트

#### TS-001: 기본 구성 생성
```typescript
// Given: 최소한의 구성 옵션
// When: buildAuthConfig 호출
// Then: 유효한 NextAuth 구성 반환
```

#### TS-002: OAuth 프로바이더 동적 활성화
```typescript
// Given: enabledOAuthProviders 배열
// When: buildAuthConfig 호출
// Then: 지정된 프로바이더만 활성화됨
```

#### TS-003: 비밀번호 인증 정책 - DISABLED
```typescript
// Given: passwordAuthPolicy: 'DISABLED'
// When: buildAuthConfig 호출
// Then: credentials 프로바이더가 제외됨
```

#### TS-004: 비밀번호 인증 정책 - DEVELOPMENT_ONLY (프로덕션)
```typescript
// Given: passwordAuthPolicy: 'DEVELOPMENT_ONLY', NODE_ENV: 'production'
// When: buildAuthConfig 호출
// Then: credentials 프로바이더가 제외됨
```

#### TS-005: 비밀번호 인증 정책 - DEVELOPMENT_ONLY (개발)
```typescript
// Given: passwordAuthPolicy: 'DEVELOPMENT_ONLY', NODE_ENV: 'development'
// When: buildAuthConfig 호출
// Then: credentials 프로바이더가 포함됨
```

#### TS-006: 이메일 도메인 제한
```typescript
// Given: allowedEmailDomains: ['company.com']
// When: buildAuthConfig 호출
// Then: 도메인 제한이 features에 설정됨
```

### 1.2 createAuthConfig 테스트

#### TS-007: 커스텀 프로바이더 구성
```typescript
// Given: 커스텀 OAuth2 프로바이더 구성
// When: createAuthConfig 호출
// Then: 커스텀 프로바이더가 포함된 구성 반환
```

#### TS-008: 콜백 구성
```typescript
// Given: 커스텀 콜백 함수들
// When: createAuthConfig 호출
// Then: 콜백이 NextAuth 구성에 포함됨
```

## 2. OAuth2 프로바이더 테스트

### 2.1 OAuth 구성 테스트

#### TS-009: Google 프로바이더 구성
```typescript
// Given: Google 클라이언트 ID/Secret
// When: getOAuthProviderConfig('google') 호출
// Then: 올바른 Google OAuth 구성 반환
```

#### TS-010: Kakao 프로바이더 구성
```typescript
// Given: Kakao 클라이언트 ID/Secret
// When: getOAuthProviderConfig('kakao') 호출
// Then: 올바른 Kakao OAuth 구성 반환
```

#### TS-011: 환경 변수에서 자격 증명 로드
```typescript
// Given: 환경 변수에 설정된 OAuth 자격 증명
// When: getOAuthProviderConfig 호출
// Then: 환경 변수에서 자격 증명 로드됨
```

#### TS-012: 잘못된 프로바이더 타입
```typescript
// Given: 지원되지 않는 프로바이더 타입
// When: getOAuthProviderConfig 호출
// Then: null 반환
```

### 2.2 OAuth 프로바이더 생성 테스트

#### TS-013: 여러 프로바이더 생성
```typescript
// Given: ['google', 'github', 'kakao'] 프로바이더 리스트
// When: createOAuthProviders 호출
// Then: 모든 프로바이더 구성 반환
```

#### TS-014: 자격 증명 누락 프로바이더 필터링
```typescript
// Given: 자격 증명이 없는 프로바이더 포함
// When: createOAuthProviders 호출
// Then: 자격 증명이 있는 프로바이더만 반환
```

#### TS-015: 프로바이더 오버라이드
```typescript
// Given: 프로바이더 오버라이드 구성
// When: createOAuthProviders 호출
// Then: 오버라이드된 설정이 적용됨
```

## 3. 인증 흐름 테스트

### 3.1 JWT 콜백 테스트

#### TS-016: 초기 로그인 - Credentials
```typescript
// Given: credentials 프로바이더로 로그인
// When: JWT 콜백 실행
// Then: 사용자 정보와 토큰이 JWT에 저장됨
```

#### TS-017: 초기 로그인 - OAuth2
```typescript
// Given: OAuth2 프로바이더로 로그인
// When: JWT 콜백 실행
// Then: OAuth 토큰이 서버 JWT로 교환됨
```

#### TS-018: 토큰 갱신 - 성공
```typescript
// Given: 만료된 토큰
// When: JWT 콜백 실행
// Then: 토큰이 성공적으로 갱신됨
```

#### TS-019: 토큰 갱신 - 실패
```typescript
// Given: 갱신 불가능한 만료된 토큰
// When: JWT 콜백 실행
// Then: 오류 상태가 토큰에 설정됨
```

### 3.2 OAuth2 토큰 교환 테스트

#### TS-020: 성공적인 토큰 교환
```typescript
// Given: 유효한 OAuth2 토큰
// When: exchangeOAuth2Token 호출
// Then: 서버 JWT 토큰 반환
```

#### TS-021: 실패한 토큰 교환 - 네트워크 오류
```typescript
// Given: 네트워크 오류 발생
// When: exchangeOAuth2Token 호출
// Then: null 반환, 오류 로깅
```

#### TS-022: 실패한 토큰 교환 - 서버 오류
```typescript
// Given: 서버에서 4xx/5xx 응답
// When: exchangeOAuth2Token 호출
// Then: null 반환, 오류 로깅
```

### 3.3 세션 콜백 테스트

#### TS-023: 세션 생성 - 정상
```typescript
// Given: 유효한 JWT 토큰
// When: 세션 콜백 실행
// Then: 사용자 정보가 세션에 설정됨
```

#### TS-024: 세션 생성 - 오류 상태
```typescript
// Given: 오류가 있는 JWT 토큰
// When: 세션 콜백 실행
// Then: 오류가 세션에 전파됨
```

## 4. React 훅 테스트

### 4.1 useAuthSession 테스트

#### TS-025: 인증된 세션
```typescript
// Given: 유효한 인증 세션
// When: useAuthSession 호출
// Then: isAuthenticated: true, 사용자 정보 반환
```

#### TS-026: 미인증 세션
```typescript
// Given: 인증되지 않은 상태
// When: useAuthSession 호출
// Then: isAuthenticated: false
```

#### TS-027: 로딩 상태
```typescript
// Given: 세션 로딩 중
// When: useAuthSession 호출
// Then: isLoading: true
```

#### TS-028: 만료된 토큰
```typescript
// Given: RefreshAccessTokenError가 있는 세션
// When: useAuthSession 호출
// Then: isExpired: true, isAuthenticated: false
```

#### TS-029: 토큰 액세스
```typescript
// Given: 인증된 세션
// When: useAuthSession 호출
// Then: accessToken 반환
```

### 4.2 useAuthenticatedFetch 테스트

#### TS-030: API 클라이언트 생성 - 인증됨
```typescript
// Given: 인증된 세션
// When: useAuthenticatedFetch 호출
// Then: 유효한 apiClient 반환
```

#### TS-031: API 클라이언트 생성 - 미인증
```typescript
// Given: 미인증 상태
// When: useAuthenticatedFetch 호출
// Then: apiClient는 null
```

#### TS-032: 토큰 변경 시 클라이언트 업데이트
```typescript
// Given: 토큰이 변경됨
// When: useAuthenticatedFetch 재실행
// Then: 새로운 토큰으로 클라이언트 업데이트
```

## 5. API 클라이언트 테스트

### 5.1 createApiClient 테스트

#### TS-033: GET 요청 - 성공
```typescript
// Given: 유효한 API 클라이언트
// When: client.get() 호출
// Then: 성공적인 응답 반환
```

#### TS-034: POST 요청 - 성공
```typescript
// Given: 유효한 API 클라이언트와 데이터
// When: client.post() 호출
// Then: 성공적인 응답 반환
```

#### TS-035: 인증 헤더 포함
```typescript
// Given: 인증 토큰이 있는 클라이언트
// When: API 요청 실행
// Then: Authorization 헤더 포함됨
```

#### TS-036: 네트워크 오류 처리
```typescript
// Given: 네트워크 오류 발생
// When: API 요청 실행
// Then: 적절한 오류 반환
```

#### TS-037: 401 오류 시 토큰 갱신 시도
```typescript
// Given: 401 응답
// When: API 요청 실행
// Then: 토큰 갱신 후 재시도
```

### 5.2 createAuthenticatedFetch 테스트

#### TS-038: 기본 fetch 래퍼
```typescript
// Given: 인증 토큰
// When: createAuthenticatedFetch 호출
// Then: 토큰이 포함된 fetch 함수 반환
```

#### TS-039: 토큰 없이 요청
```typescript
// Given: 토큰이 없는 상태
// When: authenticated fetch 호출
// Then: 토큰 없이 요청 실행
```

## 6. 컴포넌트 테스트

### 6.1 SignInForm 테스트

#### TS-040: 기본 렌더링
```typescript
// Given: 기본 props
// When: SignInForm 렌더링
// Then: 폼 요소들이 표시됨
```

#### TS-041: OAuth 버튼 렌더링
```typescript
// Given: enabledOAuthProviders 설정
// When: SignInForm 렌더링
// Then: 지정된 OAuth 버튼들이 표시됨
```

#### TS-042: 비밀번호 인증 비활성화
```typescript
// Given: enablePasswordAuth: false
// When: SignInForm 렌더링
// Then: 이메일/비밀번호 필드가 숨겨짐
```

#### TS-043: 이메일 도메인 검증
```typescript
// Given: allowedEmailDomains 설정
// When: 제한된 도메인 외 이메일 입력
// Then: 검증 오류 표시
```

#### TS-044: 로그인 성공 콜백
```typescript
// Given: onSuccess 콜백
// When: 로그인 성공
// Then: 콜백 함수 호출됨
```

#### TS-045: 로그인 실패 콜백
```typescript
// Given: onError 콜백
// When: 로그인 실패
// Then: 오류 정보와 함께 콜백 호출됨
```

### 6.2 OAuthButton 테스트

#### TS-046: Google 버튼 렌더링
```typescript
// Given: provider='google'
// When: OAuthButton 렌더링
// Then: Google 스타일 버튼 표시
```

#### TS-047: 커스텀 텍스트
```typescript
// Given: 커스텀 children
// When: OAuthButton 렌더링
// Then: 커스텀 텍스트가 표시됨
```

#### TS-048: 클릭 이벤트
```typescript
// Given: 렌더링된 OAuthButton
// When: 버튼 클릭
// Then: signIn 함수 호출됨
```

#### TS-049: 콜백 URL 설정
```typescript
// Given: callbackUrl prop
// When: 버튼 클릭
// Then: 지정된 URL로 리다이렉트
```

## 7. 오류 처리 테스트

### 7.1 네트워크 오류

#### TS-050: API 서버 다운
```typescript
// Given: API 서버 접근 불가
// When: 인증 시도
// Then: 적절한 오류 메시지 표시
```

#### TS-051: 타임아웃
```typescript
// Given: 네트워크 타임아웃
// When: API 요청
// Then: 타임아웃 오류 처리
```

### 7.2 인증 오류

#### TS-052: 잘못된 자격 증명
```typescript
// Given: 잘못된 이메일/비밀번호
// When: 로그인 시도
// Then: 인증 실패 오류 표시
```

#### TS-053: OAuth 인증 거부
```typescript
// Given: 사용자가 OAuth 인증 거부
// When: OAuth 로그인 시도
// Then: 인증 거부 처리
```

#### TS-054: 만료된 리프레시 토큰
```typescript
// Given: 만료된 리프레시 토큰
// When: 토큰 갱신 시도
// Then: 재로그인 요구
```

## 8. 통합 테스트

### 8.1 전체 인증 플로우

#### TS-055: OAuth2 로그인 플로우
```typescript
// Given: OAuth2 프로바이더 설정
// When: 로그인부터 API 호출까지 전체 플로우 실행
// Then: 모든 단계가 성공적으로 완료됨
```

#### TS-056: 자격 증명 로그인 플로우
```typescript
// Given: 이메일/비밀번호 인증 설정
// When: 로그인부터 API 호출까지 전체 플로우 실행
// Then: 모든 단계가 성공적으로 완료됨
```

#### TS-057: 토큰 갱신 플로우
```typescript
// Given: 만료되는 토큰
// When: 자동 갱신 플로우 실행
// Then: 사용자 경험 중단 없이 토큰 갱신됨
```

### 8.2 Next.js 통합

#### TS-058: Pages Router 통합
```typescript
// Given: Pages Router 애플리케이션
// When: 라이브러리 통합
// Then: 모든 기능이 정상 작동
```

#### TS-059: App Router 통합
```typescript
// Given: App Router 애플리케이션
// When: 라이브러리 통합
// Then: 모든 기능이 정상 작동
```

## 9. 성능 테스트

### 9.1 메모리 사용

#### TS-060: 메모리 누수 테스트
```typescript
// Given: 반복적인 로그인/로그아웃
// When: 장시간 실행
// Then: 메모리 누수 없음
```

### 9.2 번들 크기

#### TS-061: 트리 쉐이킹
```typescript
// Given: 일부 기능만 사용
// When: 번들 빌드
// Then: 사용하지 않는 코드는 제외됨
```

## 10. 호환성 테스트

### 10.1 브라우저 호환성

#### TS-062: 주요 브라우저 테스트
```typescript
// Given: Chrome, Firefox, Safari, Edge
// When: 라이브러리 사용
// Then: 모든 브라우저에서 정상 작동
```

### 10.2 버전 호환성

#### TS-063: Next.js 버전 호환성
```typescript
// Given: Next.js 13, 14
// When: 라이브러리 사용
// Then: 모든 버전에서 정상 작동
```

#### TS-064: NextAuth 버전 호환성
```typescript
// Given: NextAuth 4.x 버전들
// When: 라이브러리 사용
// Then: 모든 지원 버전에서 정상 작동
```

## 테스트 환경 설정

### Mock 설정
- NextAuth.js mock
- fetch API mock
- 환경 변수 mock
- React Testing Library 설정

### 테스트 데이터
- 샘플 사용자 데이터
- Mock OAuth 응답
- JWT 토큰 샘플
- 오류 응답 시나리오

### CI/CD 통합
- 자동화된 테스트 실행
- 커버리지 보고
- 크로스 브라우저 테스트
- 성능 회귀 테스트