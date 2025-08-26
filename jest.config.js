module.exports = {
    moduleFileExtensions: [ 'js', 'json', 'ts'],
    rootDir: '.',
    testTegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
   collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
