import type { TestModeConfig, TestUser } from '../types'

/**
 * Check if test mode is enabled and safe to use
 */
export function isTestModeEnabled(testMode?: TestModeConfig): boolean {
  // Only enable in development environment
  if (process.env.NODE_ENV !== 'development') {
    return false
  }
  
  // Check environment variable override
  if (process.env.NEXT_PUBLIC_TEST_MODE === 'false') {
    return false
  }
  
  return testMode?.enabled === true || process.env.NEXT_PUBLIC_TEST_MODE === 'true'
}

/**
 * Get test users from configuration or environment variables
 */
export function getTestUsers(testMode?: TestModeConfig): TestUser[] {
  const configUsers = testMode?.testUsers || []
  
  // Try to get from environment variables
  const envUsers = getTestUsersFromEnv()
  
  // Merge configuration users and environment users
  const allUsers = [...configUsers, ...envUsers]
  
  // Remove duplicates by email
  const uniqueUsers = allUsers.reduce((acc, user) => {
    if (!acc.find(u => u.email === user.email)) {
      acc.push(user)
    }
    return acc
  }, [] as TestUser[])
  
  return uniqueUsers
}

/**
 * Get test users from environment variables
 */
function getTestUsersFromEnv(): TestUser[] {
  const users: TestUser[] = []
  
  // Single test user from environment
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD
  const testName = process.env.TEST_USER_NAME || 'Test User'
  
  if (testEmail && testPassword) {
    if (isValidTestUser({ email: testEmail, password: testPassword, name: testName })) {
      users.push({
        id: 'env-test-user',
        name: testName,
        email: testEmail,
        password: testPassword,
        role: 'user'
      })
    } else {
      console.warn('Invalid test user from environment variables')
    }
  }
  
  // Multiple test users from JSON
  const testUsersJson = process.env.TEST_USERS
  if (testUsersJson) {
    try {
      const parsedUsers = JSON.parse(testUsersJson)
      if (typeof parsedUsers === 'object' && parsedUsers !== null) {
        Object.entries(parsedUsers).forEach(([key, userData]: [string, any]) => {
          if (userData && typeof userData === 'object' && userData.email && userData.password) {
            if (isValidTestUser(userData)) {
              users.push({
                id: `env-${key}`,
                name: userData.name || key,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'user'
              })
            } else {
              console.warn(`Invalid test user '${key}' from TEST_USERS environment variable`)
            }
          }
        })
      } else {
        console.warn('TEST_USERS environment variable should be a JSON object')
      }
    } catch (error) {
      console.warn('Failed to parse TEST_USERS environment variable:', error)
    }
  }
  
  return users
}

/**
 * Get default test user (first available)
 */
export function getDefaultTestUser(testMode?: TestModeConfig): TestUser | null {
  const users = getTestUsers(testMode)
  return users.length > 0 ? users[0] : null
}

/**
 * Check if auto-fill is enabled
 */
export function isAutoFillEnabled(testMode?: TestModeConfig): boolean {
  if (!isTestModeEnabled(testMode)) {
    return false
  }
  
  return testMode?.autoFill !== false // Default to true if not specified
}

/**
 * Check if quick login is enabled
 */
export function isQuickLoginEnabled(testMode?: TestModeConfig): boolean {
  if (!isTestModeEnabled(testMode)) {
    return false
  }
  
  return testMode?.quickLogin === true
}

/**
 * Validate test user data
 */
function isValidTestUser(userData: any): boolean {
  if (!userData || typeof userData !== 'object') {
    return false
  }
  
  const { email, password, name } = userData
  
  // Basic validation
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return false
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Password minimum requirements (at least 6 characters)
  if (password.length < 6) {
    return false
  }
  
  // Name validation (if provided)
  if (name && typeof name !== 'string') {
    return false
  }
  
  return true
}

/**
 * Validate test user configuration
 */
export function validateTestUsers(testUsers: TestUser[]): { valid: TestUser[], invalid: string[] } {
  const valid: TestUser[] = []
  const invalid: string[] = []
  
  testUsers.forEach(user => {
    if (isValidTestUser(user)) {
      valid.push(user)
    } else {
      invalid.push(`Invalid test user: ${user.id || 'unknown'} (${user.email || 'no email'})`)
    }
  })
  
  return { valid, invalid }
}

/**
 * Create test user credentials for sign in
 */
export function createTestCredentials(user: TestUser) {
  return {
    email: user.email,
    password: user.password
  }
}

/**
 * Get test mode debug information
 */
export function getTestModeDebugInfo(testMode?: TestModeConfig): Record<string, any> {
  return {
    environment: process.env.NODE_ENV,
    testModeEnvVar: process.env.NEXT_PUBLIC_TEST_MODE,
    isEnabled: isTestModeEnabled(testMode),
    isAutoFillEnabled: isAutoFillEnabled(testMode),
    isQuickLoginEnabled: isQuickLoginEnabled(testMode),
    testUserCount: getTestUsers(testMode).length,
    defaultTestUser: getDefaultTestUser(testMode)?.email || null,
    environmentVars: {
      hasTestUserEmail: !!process.env.TEST_USER_EMAIL,
      hasTestUserPassword: !!process.env.TEST_USER_PASSWORD,
      hasTestUsers: !!process.env.TEST_USERS
    }
  }
}