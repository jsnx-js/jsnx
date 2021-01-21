module.exports = {
  cacheDirectory: '.jest-cache',
  coverageDirectory: '.jest-coverage',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/build/', '/build-esm/'],
  coverageReporters: ['html', 'lcov', 'text-summary'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['./node_modules/', './build/', '/build-esm/'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
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
