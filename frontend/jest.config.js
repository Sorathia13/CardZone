module.exports = {
  displayName: 'CardZone Frontend',
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/src/__mocks__/axios.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};