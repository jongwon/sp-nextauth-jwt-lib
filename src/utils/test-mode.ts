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
    users.push({
      id: 'env-test-user',
      name: testName,
      email: testEmail,
      password: testPassword,
      role: 'user'
    })
  }
  
  // Multiple test users from JSON
  const testUsersJson = process.env.TEST_USERS
  if (testUsersJson) {
    try {
      const parsedUsers = JSON.parse(testUsersJson)
      Object.entries(parsedUsers).forEach(([key, userData]: [string, any]) => {
        if (userData.email && userData.password) {
          users.push({
            id: `env-${key}`,
            name: userData.name || key,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user'
          })
        }
      })
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
 * Create test user credentials for sign in
 */
export function createTestCredentials(user: TestUser) {
  return {
    email: user.email,
    password: user.password
  }
}