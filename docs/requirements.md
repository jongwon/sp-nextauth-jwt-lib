# Requirements

## Project Overview

SP NextAuth JWT Library는 Next.js 애플리케이션을 위한 재사용 가능한 인증 라이브러리입니다. NextAuth.js와 JWT 통합을 제공하며, 다양한 OAuth2 프로바이더와 선택적 이메일/비밀번호 인증을 지원합니다.

## 구현된 기능

### 1. 인증 구성 시스템

#### 1.1 Configuration Builders
- ✅ `createAuthConfig()` - 완전한 제어가 가능한 핵심 NextAuth 구성
- ✅ `buildAuthConfig()` - 합리적인 기본값을 가진 단순화된 구성 빌더
- ✅ `createSimpleAuthConfig()` - 기본 사용 사례를 위한 최소 설정

#### 1.2 인증 정책 설정
- ✅ 비밀번호 인증 정책: `ALLOW_ALL` | `DEVELOPMENT_ONLY` | `DISABLED`
- ✅ 이메일 도메인 기반 접근 제한 (`allowedEmailDomains`)
- ✅ 환경별 OAuth 프로바이더 선택적 활성화
- ✅ 개발/프로덕션 환경 인식 인증 정책

### 2. OAuth2 프로바이더 지원

#### 2.1 지원되는 프로바이더
- ✅ Google OAuth2
- ✅ Facebook OAuth2
- ✅ GitHub OAuth2
- ✅ Kakao OAuth2
- ✅ Naver OAuth2

#### 2.2 프로바이더 기능
- ✅ 사전 구성된 OAuth 설정 (`oauth-configs.ts`)
- ✅ 동적 프로바이더 활성화 (환경 변수 기반)
- ✅ OAuth 버튼 스타일 테마 지원
- ✅ 커스텀 OAuth2 프로바이더 추가 지원

### 3. 자격 증명 인증

#### 3.1 이메일/비밀번호 인증
- ✅ 백엔드 API와 통합된 자격 증명 프로바이더
- ✅ 회원가입/로그인 API 엔드포인트 지원
- ✅ 정책 기반 비밀번호 인증 제어

### 4. JWT 토큰 관리

#### 4.1 토큰 처리
- ✅ 자동 토큰 갱신 (NextAuth 콜백 활용)
- ✅ OAuth2 토큰을 서버 측 JWT로 교환
- ✅ 토큰 만료 처리 및 폴백 전략
- ✅ 세션 기반 JWT 저장 및 관리

#### 4.2 API 통합
- ✅ 인증된 API 클라이언트 (`createApiClient`)
- ✅ 자동 토큰 첨부 HTTP 클라이언트
- ✅ 토큰 갱신 실패 시 자동 재로그인 처리

### 5. 테스트 모드

#### 5.1 개발 편의 기능
- ✅ 테스트 사용자 자동 입력
- ✅ 빠른 로그인 버튼
- ✅ 환경 변수 기반 테스트 계정 설정
- ✅ 개발 환경에서만 활성화

### 6. React 통합

#### 6.1 Hooks
- ✅ `useAuthSession()` - JWT 토큰 관리가 포함된 향상된 세션 훅
- ✅ `useAuthenticatedFetch()` - 자동 토큰 처리가 포함된 API 클라이언트 훅

#### 6.2 컴포넌트
- ✅ `SignInForm` - OAuth 옵션이 포함된 완전한 로그인 폼
- ✅ `SignUpForm` - 회원가입 폼 (이메일/비밀번호 + OAuth 옵션)
- ✅ `OAuthButton` - 개별 OAuth 프로바이더 버튼
- ✅ `TestModePanel` - 개발 환경용 빠른 로그인 패널

### 7. TypeScript 지원

#### 7.1 타입 안전성
- ✅ NextAuth 세션/사용자 타입 확장 (모듈 증강)
- ✅ 모든 구성 옵션에 대한 포괄적인 TypeScript 인터페이스
- ✅ 타입이 지정된 응답을 가진 제네릭 API 클라이언트

## 요구사항

### 기능적 요구사항

#### FR-1: 인증 구성
- 다양한 인증 방법을 지원하는 유연한 구성 시스템
- 환경별 인증 정책 설정 가능
- OAuth2 프로바이더 동적 활성화/비활성화

#### FR-2: OAuth2 인증
- 주요 OAuth2 프로바이더 지원 (Google, Facebook, GitHub, Kakao, Naver)
- 커스텀 OAuth2 프로바이더 추가 지원
- OAuth2 토큰을 서버 JWT로 안전한 교환

#### FR-3: 자격 증명 인증
- 이메일/비밀번호 기반 인증
- 백엔드 API와의 안전한 통합
- 도메인 기반 접근 제어

#### FR-4: JWT 토큰 관리
- 자동 토큰 갱신 메커니즘
- 토큰 만료 처리
- 안전한 토큰 저장 및 관리

#### FR-5: React 통합
- Next.js 애플리케이션과의 원활한 통합
- 사용하기 쉬운 React 훅 제공
- 즉시 사용 가능한 UI 컴포넌트

### 비기능적 요구사항

#### NFR-1: 보안
- JWT 토큰의 안전한 처리
- CSRF 보호
- 안전한 쿠키 설정

#### NFR-2: 성능
- 토큰 캐싱 및 효율적인 갱신
- 최소한의 번들 크기
- 지연 로딩 지원

#### NFR-3: 사용성
- 직관적인 API 설계
- 포괄적인 문서화
- TypeScript 지원으로 개발자 경험 향상

#### NFR-4: 호환성
- Next.js 13+ 지원 (Pages Router 및 App Router)
- NextAuth.js 4+ 호환성
- React 18+ 지원

#### NFR-5: 확장성
- 커스텀 프로바이더 추가 지원
- 플러그인 아키텍처
- 구성 가능한 콜백 시스템

## 환경 구성

### 필수 환경 변수
- `NEXTAUTH_SECRET` - JWT 서명 비밀키
- `NEXTAUTH_URL` - 애플리케이션 URL (리다이렉트용)
- `NEXT_PUBLIC_API_URL` - 백엔드 API 기본 URL

### OAuth 프로바이더별 환경 변수
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Facebook: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- GitHub: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Kakao: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- Naver: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`

## 의존성

### Peer Dependencies
- `next`: ^13.0.0 || ^14.0.0
- `next-auth`: ^4.0.0
- `react`: ^18.0.0

### Runtime Dependencies
- `jsonwebtoken`: ^9.0.2

### Development Dependencies
- TypeScript 5+
- 관련 타입 정의 패키지

## 빌드 및 배포

### 빌드 출력
- `dist/` - 컴파일된 JavaScript 및 TypeScript 선언 파일
- CommonJS 모듈 형식
- TypeScript 선언 파일 포함

### 패키징
- NPM 패키지로 배포
- `package.json` files 필드에 `dist` 및 `README.md`만 포함
- Semantic versioning 준수