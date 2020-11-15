// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'test library modules',
      testEnvironment: 'node'
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/src/**']
    }
  ],

  collectCoverageFrom: [
    './src/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/__tests__/**'
  ],

  coverageReporters: ['lcov', 'text', 'html']
};
