import React from 'react'
import { buildAuthConfig } from '../src/config'
import { SignInForm } from '../src/components'
import { TestModePanel } from '../src/components/test-mode-panel'

/**
 * Test Mode Example - Demonstrates all test mode features
 * 
 * This example shows how to use the test mode functionality in a real Next.js application.
 * Run this in development environment to see the test mode features in action.
 */

// Example 1: Basic Test Mode with Auto-fill
export const BasicTestModeExample = () => {
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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
    <div className="example-container">
      <h3>Basic Test Mode - Auto-fill Only</h3>
      <p>This form will auto-fill with test user credentials from environment variables.</p>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}

// Example 2: Quick Login Buttons with Predefined Users
export const QuickLoginExample = () => {
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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
          },
          {
            id: 'guest-user',
            name: 'Guest User',
            email: 'guest@test.com',
            password: 'guest123',
            role: 'guest'
          }
        ]
      }
    }
  })

  return (
    <div className="example-container">
      <h3>Quick Login Test Mode</h3>
      <p>This form includes quick login buttons for different user roles.</p>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}

// Example 3: Environment Variables Only
export const EnvironmentVariablesExample = () => {
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    features: {
      enablePasswordAuth: true,
      testMode: {
        enabled: true,
        autoFill: true,
        quickLogin: true
        // No testUsers defined - will use environment variables
      }
    }
  })

  return (
    <div className="example-container">
      <h3>Environment Variables Test Mode</h3>
      <p>This form uses test users defined in environment variables.</p>
      <p>Set TEST_USERS in your .env.local file:</p>
      <pre>{`TEST_USERS='{"admin":{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"},"user":{"name":"Normal User","email":"user@test.com","password":"user123","role":"user"}}'`}</pre>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}

// Example 4: Mixed Configuration (Both Config and Environment)
export const MixedConfigurationExample = () => {
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    features: {
      enablePasswordAuth: true,
      testMode: {
        enabled: true,
        autoFill: true,
        quickLogin: true,
        testUsers: [
          {
            id: 'config-admin',
            name: 'Config Admin',
            email: 'config-admin@test.com',
            password: 'config123',
            role: 'admin'
          }
        ]
      }
    }
  })

  return (
    <div className="example-container">
      <h3>Mixed Configuration Test Mode</h3>
      <p>This form combines configuration users with environment variables.</p>
      <p>Configuration users take priority over environment variables for the same email.</p>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}

// Example 5: Standalone Test Mode Panel
export const StandaloneTestPanelExample = () => {
  const testModeConfig = {
    enabled: true,
    quickLogin: true,
    testUsers: [
      {
        id: 'standalone-admin',
        name: 'Standalone Admin',
        email: 'standalone@test.com',
        password: 'standalone123',
        role: 'admin'
      },
      {
        id: 'standalone-user',
        name: 'Standalone User',
        email: 'user@test.com',
        password: 'user123',
        role: 'user'
      }
    ]
  }

  return (
    <div className="example-container">
      <h3>Standalone Test Mode Panel</h3>
      <p>This shows how to use the TestModePanel component independently.</p>
      <TestModePanel
        testMode={testModeConfig}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Standalone test login successful')}
        onError={(error) => console.error('Standalone test login failed:', error)}
      />
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <h4>Your Custom Login Form</h4>
        <p>Add your own login form components here...</p>
      </div>
    </div>
  )
}

// Example 6: Production Environment Test (Should Be Disabled)
export const ProductionEnvironmentExample = () => {
  // This will be disabled in production environment
  const authConfig = buildAuthConfig({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    features: {
      enablePasswordAuth: true,
      testMode: {
        enabled: true,
        autoFill: true,
        quickLogin: true,
        testUsers: [
          {
            id: 'prod-test',
            name: 'Production Test',
            email: 'prod@test.com',
            password: 'prod123',
            role: 'admin'
          }
        ]
      }
    }
  })

  return (
    <div className="example-container">
      <h3>Production Environment Test</h3>
      <p>This form should NOT show test mode features in production.</p>
      <p>Current environment: {process.env.NODE_ENV}</p>
      <SignInForm 
        features={authConfig.features}
        callbackUrl="/dashboard"
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}

// Complete Example Page Component
export const TestModeExamplesPage = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Mode Examples</h1>
      <p>These examples demonstrate all the test mode features in SP NextAuth JWT Library.</p>
      
      <div style={{ marginBottom: '3rem' }}>
        <h2>Environment Setup</h2>
        <p>Add these variables to your <code>.env.local</code> file:</p>
        <pre style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
{`# Basic test mode activation
NODE_ENV=development
NEXT_PUBLIC_TEST_MODE=true

# Single test user
TEST_USER_EMAIL=dev@test.com
TEST_USER_PASSWORD=test123
TEST_USER_NAME=Dev User

# Multiple test users (JSON format)
TEST_USERS='{"admin":{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"},"user":{"name":"Normal User","email":"user@test.com","password":"user123","role":"user"},"guest":{"name":"Guest User","email":"guest@test.com","password":"guest123","role":"guest"}}'`}
        </pre>
      </div>

      <div style={{ display: 'grid', gap: '3rem' }}>
        <BasicTestModeExample />
        <QuickLoginExample />
        <EnvironmentVariablesExample />
        <MixedConfigurationExample />
        <StandaloneTestPanelExample />
        <ProductionEnvironmentExample />
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
        <h3>⚠️ Security Notes</h3>
        <ul>
          <li>Test mode is automatically disabled in production environments</li>
          <li>Never commit test credentials to your repository</li>
          <li>Use different test accounts for different environments</li>
          <li>Ensure your .env.local file is in .gitignore</li>
        </ul>
      </div>

      <style jsx>{`
        .example-container {
          padding: 2rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }
        
        .example-container h3 {
          margin-top: 0;
          color: #1f2937;
        }
        
        .example-container p {
          color: #6b7280;
          margin-bottom: 1rem;
        }
        
        pre {
          font-size: 0.875rem;
          line-height: 1.4;
          overflow-x: auto;
        }
        
        code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}

export default TestModeExamplesPage