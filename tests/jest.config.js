'use strict';

module.exports = {
    rootDir: '.',
    testMatch: ['**/*.test.js'],
    testEnvironment: 'node',
    transform: {},
    setupFilesAfterEnv: ['./setup.js'],
    testTimeout: 30000,
    verbose: true,
    collectCoverage: false,
};
