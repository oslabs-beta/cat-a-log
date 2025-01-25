// Changed from module.export to export default to support ES vs CommonJS
// Also renamed file from .js to .mjs
// export default {
export default {
    preset: 'ts-jest/presets/default-esm',
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
        // Following required for compatibility with ES vs CommonJS
        extensionsToTreatAsEsm: ['.ts'],
        globals: {
          'ts-jest': {
            useESM: true,
          },
        },
  };