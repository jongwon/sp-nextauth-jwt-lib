import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import type { AuthFeatures } from '../types'
import { OAuthButton } from './oauth-button'

export interface SignUpFormProps {
  features?: AuthFeatures
  callbackUrl?: string
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  signUpEndpoint?: string
}

/**
 * Sign-up form component with password and OAuth options
 */
export function SignUpForm({
  features = {},
  callbackUrl = '/',
  className = '',
  onSuccess,
  onError,
  signUpEndpoint = '/api/auth/signup'
}: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Check email domain if restrictions are set
    if (!isEmailAllowed(formData.email)) {
      setError(`Email domain not allowed. Allowed domains: ${features.allowedEmailDomains?.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      // Get API base URL from environment or default
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const signUpUrl = `${apiBaseUrl}${signUpEndpoint}`
      
      const response = await fetch(signUpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Sign up failed' }))
        throw new Error(data.error || data.message || 'Sign up failed')
      }

      // Auto sign-in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        throw new Error('Sign up successful but auto sign-in failed. Please sign in manually.')
      }

      if (result?.ok) {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
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
  
  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError(null) // Clear error when user types
  }
  
  return (
    <div className={`signup-form ${className}`}>
      {showPasswordAuth && (
        <>
          <form onSubmit={handleSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Your name"
                required
                disabled={isLoading}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="email@example.com"
                required
                disabled={isLoading}
                className="form-input"
              />
              {features.allowedEmailDomains && features.allowedEmailDomains.length > 0 && (
                <small className="email-hint">
                  Allowed domains: {features.allowedEmailDomains.join(', ')}
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="form-input"
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="form-input"
                minLength={6}
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || (!!formData.email && !isEmailAllowed(formData.email))}
              className="submit-button"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
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
          <p className="oauth-text">Sign up with:</p>
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
        .signup-form {
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
        
        .email-hint {
          font-size: 0.75rem;
          color: #6b7280;
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
          margin-top: 0.5rem;
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
        
        .oauth-text {
          font-size: 0.875rem;
          color: #374151;
          text-align: center;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  )
}