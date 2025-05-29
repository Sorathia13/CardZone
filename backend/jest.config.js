module.exports = {
  displayName: 'CardZone Backend',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'index.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true
};