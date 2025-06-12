'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import type { AuthFeatures, OAuthProviderType } from '../types'
import { OAuthButton } from './oauth-button'
import { TestModePanel } from './test-mode-panel'
import { 
  isTestModeEnabled, 
  isAutoFillEnabled, 
  getDefaultTestUser 
} from '../utils/test-mode'

export interface SignInFormProps {
  features?: AuthFeatures
  callbackUrl?: string
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Sign-in form component with password and OAuth options
 */
export function SignInForm({
  features = {},
  callbackUrl = '/',
  className = '',
  onSuccess,
  onError
}: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if password auth is enabled
  const passwordAuthEnabled = features.enablePasswordAuth !== false &&
    features.passwordAuthPolicy !== 'DISABLED'
  
  // Check if we're in development
  const isDevelopment = process.env.NODE_ENV === 'development'
  const showPasswordAuth = passwordAuthEnabled && 
    (features.passwordAuthPolicy !== 'DEVELOPMENT_ONLY' || isDevelopment)
  
  // Get enabled OAuth providers
  const enabledProviders = features.enabledOAuthProviders || []
  
  // Auto-fill test credentials if enabled
  useEffect(() => {
    if (isAutoFillEnabled(features.testMode)) {
      const defaultUser = getDefaultTestUser(features.testMode)
      if (defaultUser) {
        setEmail(defaultUser.email)
        setPassword(defaultUser.password)
      }
    }
  }, [features.testMode])
  
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      if (result?.ok) {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Check email domain if restrictions are set
  const isEmailAllowed = (email: string) => {
    if (!features.allowedEmailDomains || features.allowedEmailDomains.length === 0) {
      return true
    }
    const domain = email.split('@')[1]
    return features.allowedEmailDomains.includes(domain)
  }
  
  return (
    <div className={`signin-form ${className}`}>
      {/* Test Mode Panel */}
      {isTestModeEnabled(features.testMode) && (
        <TestModePanel
          testMode={features.testMode}
          callbackUrl={callbackUrl}
          onSuccess={onSuccess}
          onError={onError}
          className="test-mode-signin"
        />
      )}
      
      {showPasswordAuth && (
        <>
          <form onSubmit={handlePasswordSignIn} className="password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                disabled={isLoading}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="form-input"
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || (!!email && !isEmailAllowed(email))}
              className="submit-button"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          {enabledProviders.length > 0 && (
            <div className="divider">
              <span>or</span>
            </div>
          )}
        </>
      )}
      
      {enabledProviders.length > 0 && (
        <div className="oauth-providers">
          {enabledProviders.map(provider => (
            <OAuthButton
              key={provider}
              provider={provider}
              callbackUrl={callbackUrl}
              className="oauth-provider-button"
            />
          ))}
        </div>
      )}
      
      <style jsx>{`
        .signin-form {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .password-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
        
        .submit-button {
          padding: 0.75rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        
        .submit-button:hover:not(:disabled) {
          background-color: #2563eb;
        }
        
        .submit-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        
        .error-message {
          padding: 0.75rem;
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 0.375rem;
          color: #991b1b;
          font-size: 0.875rem;
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: #e5e7eb;
        }
        
        .divider span {
          padding: 0 1rem;
        }
        
        .oauth-providers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  )
}