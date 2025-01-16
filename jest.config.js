module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
    coverageDirectory: 'coverage',
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)', // Matches .js, .jsx, .ts, and .tsx files in __tests__
        '**/?(*.)+(spec|test).[tj]s?(x)', // Matches .spec or .test in .js, .jsx, .ts, and .tsx files
        ],
  };