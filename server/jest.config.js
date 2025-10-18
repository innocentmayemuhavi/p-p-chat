export default {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
};
