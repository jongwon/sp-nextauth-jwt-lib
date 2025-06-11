# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SP NextAuth JWT Library is a reusable authentication library for Next.js applications using NextAuth.js with JWT integration. It provides configurable authentication methods including OAuth2 providers (Google, Facebook, GitHub, Kakao, Naver) and optional email/password authentication.

## Commands

### Development
```bash
# Build the library
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean

# Prepare for publishing (runs build)
npm run prepare
```

### TypeScript
```bash
# Type checking (manual)
npx tsc --noEmit

# Build with TypeScript
tsc
```

## Architecture

### Core Components

The library is structured around a modular architecture:

1. **Configuration Builders** (`src/config/`):
   - `createAuthConfig()` - Core NextAuth configuration with full control
   - `buildAuthConfig()` - Simplified configuration builder with sensible defaults
   - `createSimpleAuthConfig()` - Minimal setup for basic use cases

2. **Provider System** (`src/providers/`):
   - `credentials.ts` - Email/password authentication provider
   - `oauth2.ts` - Generic OAuth2 provider factory
   - `oauth-configs.ts` - Pre-configured OAuth providers (Google, Facebook, GitHub, Kakao, Naver)

3. **React Integration** (`src/hooks/`, `src/components/`):
   - `useAuthSession()` - Enhanced session hook with JWT token management
   - `useAuthenticatedFetch()` - API client with automatic token handling
   - `SignInForm` - Complete authentication form with OAuth options
   - `OAuthButton` - Individual OAuth provider buttons

4. **API Client** (`src/utils/`):
   - `createApiClient()` - Authenticated HTTP client with token refresh
   - `createAuthenticatedFetch()` - Fetch wrapper with JWT handling

### Key Patterns

1. **Configurable Authentication Policies**:
   - `passwordAuthPolicy`: 'ALLOW_ALL' | 'DEVELOPMENT_ONLY' | 'DISABLED'
   - Domain-based email restrictions via `allowedEmailDomains`
   - Environment-aware OAuth provider selection

2. **JWT Token Management**:
   - Automatic token refresh via NextAuth callbacks
   - OAuth2 token exchange for server-side JWT
   - Token expiration handling with fallback strategies

3. **Provider Configuration System**:
   - Centralized OAuth provider configurations in `oauth-configs.ts`
   - Dynamic provider enabling based on environment variables
   - Style theming support for OAuth buttons

4. **Type Safety**:
   - Extended NextAuth session/user types via module augmentation
   - Comprehensive TypeScript interfaces for all configuration options
   - Generic API client with typed responses

### Authentication Flow

1. **OAuth2 Flow**:
   - Provider redirects to NextAuth
   - OAuth token exchanged for server JWT via `exchangeOAuth2Token()`
   - JWT stored in NextAuth session with automatic refresh

2. **Credentials Flow**:
   - Email/password sent to backend API
   - Server returns JWT token directly
   - Token managed through NextAuth session

3. **Token Refresh**:
   - Automatic refresh when tokens expire
   - Fallback to OAuth refresh tokens when available
   - Error handling for expired sessions

### Environment Configuration

The library expects these environment variables:
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Application URL for redirects
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- OAuth provider credentials: `{PROVIDER}_CLIENT_ID`, `{PROVIDER}_CLIENT_SECRET`

### Build Output

- `dist/` - Compiled JavaScript and TypeScript declarations
- `package.json` files field includes only `dist` and `README.md`
- Peer dependencies: Next.js, NextAuth.js, React
- Single dependency: jsonwebtoken for JWT handling