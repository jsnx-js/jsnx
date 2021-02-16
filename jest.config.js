module.exports = {
  collectCoverage: true,
  projects: ['./packages/*', './examples/*'],
  cacheDirectory: '.jest-cache',
  coverageDirectory: '.jest-coverage',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/build/'],
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coveragePathIgnorePatterns: ['./node_modules/', './build/'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@jsnx-js/(.*)$': '<rootDir>/pacakges/$1/src',
  },
  coverageThreshold: {
    global: {
      lines: 95,
      branches: 95,
      functions: 95,
      statements: 95,
    },
  },
};
