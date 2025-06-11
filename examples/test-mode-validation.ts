/**
 * Test Mode Validation Script
 * 
 * This script validates all test mode functionality according to the requirements
 * mentioned in issue #2. Run this in a development environment to verify
 * all features are working correctly.
 */

import { 
  isTestModeEnabled, 
  getTestUsers, 
  getDefaultTestUser, 
  isAutoFillEnabled, 
  isQuickLoginEnabled 
} from '../src/utils/test-mode'
import type { TestModeConfig, TestUser } from '../src/types'

// Test scenario data
const mockEnvironmentVars = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_TEST_MODE: 'true',
  TEST_USER_EMAIL: 'dev@test.com',
  TEST_USER_PASSWORD: 'test123',
  TEST_USER_NAME: 'Dev User',
  TEST_USERS: JSON.stringify({
    admin: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    },
    user: {
      name: 'Normal User',
      email: 'user@test.com',
      password: 'user123',
      role: 'user'
    },
    guest: {
      name: 'Guest User',
      email: 'guest@test.com',
      password: 'guest123',
      role: 'guest'
    }
  })
}

const testUsers: TestUser[] = [
  {
    id: 'config-admin',
    name: 'Config Admin',
    email: 'config-admin@test.com',
    password: 'config123',
    role: 'admin'
  },
  {
    id: 'config-user',
    name: 'Config User',
    email: 'config-user@test.com',
    password: 'user123',
    role: 'user'
  }
]

// Validation interface
interface ValidationResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

class TestModeValidator {
  private results: ValidationResult[] = []
  private originalEnv: Record<string, string | undefined> = {}

  constructor() {
    // Store original environment variables
    this.originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
      TEST_USER_NAME: process.env.TEST_USER_NAME,
      TEST_USERS: process.env.TEST_USERS
    }
  }

  private setEnv(vars: Record<string, string>) {
    Object.entries(vars).forEach(([key, value]) => {
      process.env[key] = value
    })
  }

  private restoreEnv() {
    Object.entries(this.originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    })
  }

  private addResult(result: ValidationResult) {
    this.results.push(result)
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.testName}: ${result.message}`)
    if (result.details) {
      console.log('   Details:', result.details)
    }
  }

  async validateAutoFillFunctionality() {
    console.log('\n📝 Testing Auto-fill Functionality')

    // Test 1: Auto-fill enabled with default settings
    this.setEnv(mockEnvironmentVars)
    const testModeConfig: TestModeConfig = {
      enabled: true,
      autoFill: true,
      testUsers
    }

    const autoFillEnabled = isAutoFillEnabled(testModeConfig)
    this.addResult({
      testName: 'Auto-fill enabled check',
      passed: autoFillEnabled === true,
      message: autoFillEnabled ? 'Auto-fill is correctly enabled' : 'Auto-fill should be enabled'
    })

    // Test 2: Default test user retrieval
    const defaultUser = getDefaultTestUser(testModeConfig)
    this.addResult({
      testName: 'Default test user retrieval',
      passed: defaultUser !== null && defaultUser.email === 'config-admin@test.com',
      message: defaultUser ? `Retrieved default user: ${defaultUser.email}` : 'No default user found',
      details: defaultUser
    })

    // Test 3: Auto-fill disabled
    const disabledConfig: TestModeConfig = {
      enabled: true,
      autoFill: false,
      testUsers
    }
    
    const autoFillDisabled = isAutoFillEnabled(disabledConfig)
    this.addResult({
      testName: 'Auto-fill disabled check',
      passed: autoFillDisabled === false,
      message: autoFillDisabled ? 'Auto-fill should be disabled' : 'Auto-fill is correctly disabled'
    })
  }

  async validateQuickLoginButtons() {
    console.log('\n🚀 Testing Quick Login Buttons')

    this.setEnv(mockEnvironmentVars)
    
    // Test 1: Quick login enabled
    const quickLoginConfig: TestModeConfig = {
      enabled: true,
      quickLogin: true,
      testUsers
    }

    const quickLoginEnabled = isQuickLoginEnabled(quickLoginConfig)
    this.addResult({
      testName: 'Quick login enabled check',
      passed: quickLoginEnabled === true,
      message: quickLoginEnabled ? 'Quick login is correctly enabled' : 'Quick login should be enabled'
    })

    // Test 2: Quick login disabled
    const disabledConfig: TestModeConfig = {
      enabled: true,
      quickLogin: false,
      testUsers
    }

    const quickLoginDisabled = isQuickLoginEnabled(disabledConfig)
    this.addResult({
      testName: 'Quick login disabled check',
      passed: quickLoginDisabled === false,
      message: quickLoginDisabled ? 'Quick login should be disabled' : 'Quick login is correctly disabled'
    })

    // Test 3: Test users availability
    const users = getTestUsers(quickLoginConfig)
    this.addResult({
      testName: 'Test users availability',
      passed: users.length >= 2,
      message: `Found ${users.length} test users for quick login`,
      details: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
    })
  }

  async validateEnvironmentVariableIntegration() {
    console.log('\n🔧 Testing Environment Variable Integration')

    // Test 1: Single test user from environment
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true',
      TEST_USER_EMAIL: 'single@test.com',
      TEST_USER_PASSWORD: 'single123',
      TEST_USER_NAME: 'Single User'
    })

    const singleUserConfig: TestModeConfig = { enabled: true }
    const singleUsers = getTestUsers(singleUserConfig)
    const hasSingleUser = singleUsers.some(u => u.email === 'single@test.com')
    
    this.addResult({
      testName: 'Single user from environment',
      passed: hasSingleUser,
      message: hasSingleUser ? 'Single test user loaded from environment' : 'Failed to load single test user',
      details: singleUsers.find(u => u.email === 'single@test.com')
    })

    // Test 2: Multiple users from JSON environment variable
    this.setEnv(mockEnvironmentVars)
    const multiUserConfig: TestModeConfig = { enabled: true }
    const multiUsers = getTestUsers(multiUserConfig)
    const hasJsonUsers = multiUsers.some(u => u.email === 'admin@test.com')

    this.addResult({
      testName: 'Multiple users from JSON environment',
      passed: hasJsonUsers,
      message: hasJsonUsers ? 'Multiple test users loaded from JSON environment' : 'Failed to load JSON test users',
      details: multiUsers.filter(u => u.id.startsWith('env-'))
    })

    // Test 3: Invalid JSON handling
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true',
      TEST_USERS: 'invalid-json'
    })

    const invalidJsonConfig: TestModeConfig = { enabled: true }
    const invalidJsonUsers = getTestUsers(invalidJsonConfig)
    
    this.addResult({
      testName: 'Invalid JSON handling',
      passed: invalidJsonUsers.length === 0,
      message: 'Invalid JSON properly handled without crashing',
      details: { userCount: invalidJsonUsers.length }
    })
  }

  async validateMultipleTestAccountSupport() {
    console.log('\n👥 Testing Multiple Test Account Support')

    this.setEnv(mockEnvironmentVars)
    
    // Test 1: Configuration and environment user merging
    const mergedConfig: TestModeConfig = {
      enabled: true,
      testUsers: [
        {
          id: 'config-special',
          name: 'Special Config User',
          email: 'special@test.com',
          password: 'special123',
          role: 'special'
        }
      ]
    }

    const mergedUsers = getTestUsers(mergedConfig)
    const hasConfigUser = mergedUsers.some(u => u.email === 'special@test.com')
    const hasEnvUser = mergedUsers.some(u => u.email === 'admin@test.com')

    this.addResult({
      testName: 'Configuration and environment user merging',
      passed: hasConfigUser && hasEnvUser,
      message: `Merged users: ${mergedUsers.length} total (config + env)`,
      details: mergedUsers.map(u => ({ source: u.id.startsWith('env-') ? 'env' : 'config', email: u.email, role: u.role }))
    })

    // Test 2: Duplicate email handling
    const duplicateConfig: TestModeConfig = {
      enabled: true,
      testUsers: [
        {
          id: 'config-admin-duplicate',
          name: 'Config Admin Override',
          email: 'admin@test.com', // Same email as environment
          password: 'override123',
          role: 'super-admin'
        }
      ]
    }

    const duplicateUsers = getTestUsers(duplicateConfig)
    const adminUsers = duplicateUsers.filter(u => u.email === 'admin@test.com')
    
    this.addResult({
      testName: 'Duplicate email handling',
      passed: adminUsers.length === 1,
      message: `Duplicate emails properly handled: ${adminUsers.length} admin@test.com user(s)`,
      details: adminUsers[0]
    })

    // Test 3: Role-based user organization
    const roleUsers = mergedUsers.reduce((acc, user) => {
      const role = user.role || 'user'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    this.addResult({
      testName: 'Role-based user organization',
      passed: Object.keys(roleUsers).length >= 2,
      message: `Users organized by roles: ${Object.keys(roleUsers).join(', ')}`,
      details: roleUsers
    })
  }

  async validateDevelopmentOnlyOperation() {
    console.log('\n🔒 Testing Development-Only Operation')

    // Test 1: Development environment - should be enabled
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })

    const devConfig: TestModeConfig = { enabled: true }
    const devEnabled = isTestModeEnabled(devConfig)
    
    this.addResult({
      testName: 'Development environment activation',
      passed: devEnabled === true,
      message: devEnabled ? 'Test mode correctly enabled in development' : 'Test mode should be enabled in development'
    })

    // Test 2: Production environment - should be disabled
    this.setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })

    const prodEnabled = isTestModeEnabled(devConfig)
    
    this.addResult({
      testName: 'Production environment restriction',
      passed: prodEnabled === false,
      message: prodEnabled ? 'Test mode should be disabled in production' : 'Test mode correctly disabled in production'
    })

    // Test 3: Environment variable override
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'false'
    })

    const overrideDisabled = isTestModeEnabled(devConfig)
    
    this.addResult({
      testName: 'Environment variable override',
      passed: overrideDisabled === false,
      message: overrideDisabled ? 'Environment override should disable test mode' : 'Environment variable correctly overrides test mode'
    })

    // Test 4: Test mode with disabled config
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })

    const disabledConfig: TestModeConfig = { enabled: false }
    const configDisabled = isTestModeEnabled(disabledConfig)
    
    this.addResult({
      testName: 'Configuration disabled override',
      passed: configDisabled === false,
      message: configDisabled ? 'Config should disable test mode' : 'Configuration correctly disables test mode'
    })
  }

  async validateSecurityAndErrorHandling() {
    console.log('\n🛡️ Testing Security and Error Handling')

    // Test 1: Test mode disabled in production regardless of config
    this.setEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })

    const prodSecurityConfig: TestModeConfig = {
      enabled: true,
      autoFill: true,
      quickLogin: true,
      testUsers
    }

    const prodTestModeEnabled = isTestModeEnabled(prodSecurityConfig)
    const prodAutoFillEnabled = isAutoFillEnabled(prodSecurityConfig)
    const prodQuickLoginEnabled = isQuickLoginEnabled(prodSecurityConfig)

    this.addResult({
      testName: 'Production security check',
      passed: !prodTestModeEnabled && !prodAutoFillEnabled && !prodQuickLoginEnabled,
      message: 'All test mode features correctly disabled in production',
      details: {
        testMode: prodTestModeEnabled,
        autoFill: prodAutoFillEnabled,
        quickLogin: prodQuickLoginEnabled
      }
    })

    // Test 2: Empty test users handling
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })

    const emptyConfig: TestModeConfig = {
      enabled: true,
      testUsers: []
    }

    const emptyUsers = getTestUsers(emptyConfig)
    const emptyDefaultUser = getDefaultTestUser(emptyConfig)

    this.addResult({
      testName: 'Empty test users handling',
      passed: emptyUsers.length === 0 && emptyDefaultUser === null,
      message: 'Empty test users list handled gracefully',
      details: { userCount: emptyUsers.length, defaultUser: emptyDefaultUser }
    })

    // Test 3: Missing environment variables
    this.setEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_TEST_MODE: 'true'
    })
    // Remove all test user environment variables
    delete process.env.TEST_USER_EMAIL
    delete process.env.TEST_USER_PASSWORD
    delete process.env.TEST_USERS

    const noEnvConfig: TestModeConfig = { enabled: true }
    const noEnvUsers = getTestUsers(noEnvConfig)

    this.addResult({
      testName: 'Missing environment variables handling',
      passed: noEnvUsers.length === 0,
      message: 'Missing environment variables handled without errors',
      details: { userCount: noEnvUsers.length }
    })
  }

  async runAllValidations(): Promise<ValidationResult[]> {
    console.log('🧪 Starting Test Mode Validation')
    console.log('=' * 50)

    try {
      await this.validateAutoFillFunctionality()
      await this.validateQuickLoginButtons()
      await this.validateEnvironmentVariableIntegration()
      await this.validateMultipleTestAccountSupport()
      await this.validateDevelopmentOnlyOperation()
      await this.validateSecurityAndErrorHandling()

      console.log('\n' + '=' * 50)
      console.log('📊 Validation Summary')
      
      const passed = this.results.filter(r => r.passed).length
      const total = this.results.length
      const passRate = Math.round((passed / total) * 100)

      console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`)
      
      if (passed < total) {
        console.log(`❌ Failed: ${total - passed}`)
        console.log('\nFailed Tests:')
        this.results.filter(r => !r.passed).forEach(r => {
          console.log(`  - ${r.testName}: ${r.message}`)
        })
      }

      if (passRate === 100) {
        console.log('\n🎉 All test mode features are working correctly!')
      } else if (passRate >= 80) {
        console.log('\n⚠️ Most features are working, but some issues need attention.')
      } else {
        console.log('\n🚨 Significant issues found. Please review the implementation.')
      }

    } finally {
      this.restoreEnv()
    }

    return this.results
  }
}

// Export for use in tests or standalone execution
export { TestModeValidator, type ValidationResult }

// Allow running as standalone script
if (typeof window === 'undefined' && require.main === module) {
  const validator = new TestModeValidator()
  validator.runAllValidations().then(results => {
    process.exit(results.every(r => r.passed) ? 0 : 1)
  }).catch(error => {
    console.error('Validation failed with error:', error)
    process.exit(1)
  })
}