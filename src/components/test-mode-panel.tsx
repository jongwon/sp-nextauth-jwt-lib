'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import type { TestModeConfig, TestUser } from '../types'
import { 
  isTestModeEnabled, 
  getTestUsers, 
  isQuickLoginEnabled,
  createTestCredentials 
} from '../utils/test-mode'

export interface TestModePanelProps {
  testMode?: TestModeConfig
  callbackUrl?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
}

/**
 * Test mode panel with quick login options for development
 */
export function TestModePanel({
  testMode,
  callbackUrl = '/',
  onSuccess,
  onError,
  className = ''
}: TestModePanelProps) {
  if (!isTestModeEnabled(testMode)) {
    return null
  }

  const testUsers = getTestUsers(testMode)
  const showQuickLogin = isQuickLoginEnabled(testMode)

  const handleTestLogin = async (user: TestUser) => {
    try {
      const credentials = createTestCredentials(user)
      const result = await signIn('credentials', {
        ...credentials,
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
      const error = new Error(`Test login failed for ${user.email}: ${err.message}`)
      onError?.(error)
      console.error('Test login error:', error)
    }
  }

  if (!showQuickLogin || testUsers.length === 0) {
    return null
  }

  return (
    <div className={`test-mode-panel ${className}`}>
      <div className="test-mode-header">
        <span className="test-mode-badge">DEV</span>
        <span className="test-mode-title">Quick Login</span>
      </div>
      
      <div className="test-users">
        {testUsers.map(user => (
          <button
            key={user.id}
            onClick={() => handleTestLogin(user)}
            className="test-user-button"
            type="button"
          >
            <div className="test-user-info">
              <div className="test-user-name">{user.name}</div>
              <div className="test-user-email">{user.email}</div>
              {user.role && (
                <div className="test-user-role">{user.role}</div>
              )}
            </div>
            <div className="test-login-arrow">→</div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .test-mode-panel {
          border: 2px dashed #f59e0b;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          background-color: #fef3c7;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(245, 158, 11, 0.1) 10px,
            rgba(245, 158, 11, 0.1) 20px
          );
        }

        .test-mode-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .test-mode-badge {
          background-color: #f59e0b;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .test-mode-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #92400e;
        }

        .test-users {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .test-user-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem;
          background-color: white;
          border: 1px solid #d97706;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .test-user-button:hover {
          background-color: #fbbf24;
          border-color: #b45309;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .test-user-button:active {
          transform: translateY(0);
        }

        .test-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .test-user-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: #92400e;
        }

        .test-user-email {
          font-size: 0.75rem;
          color: #a3a3a3;
          font-family: monospace;
        }

        .test-user-role {
          font-size: 0.75rem;
          color: #f59e0b;
          font-weight: 500;
          text-transform: uppercase;
        }

        .test-login-arrow {
          color: #d97706;
          font-size: 1.25rem;
          font-weight: bold;
          transition: transform 0.15s;
        }

        .test-user-button:hover .test-login-arrow {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .test-mode-panel {
            margin: 0.5rem 0;
            padding: 0.75rem;
          }
          
          .test-user-button {
            padding: 0.5rem;
          }
          
          .test-user-name {
            font-size: 0.8125rem;
          }
          
          .test-user-email {
            font-size: 0.6875rem;
          }
        }
      `}</style>
    </div>
  )
}