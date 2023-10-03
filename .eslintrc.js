module.exports = {
  ignorePatterns: ["**/*.spec.ts", "./example/*.ts"],
  parserOptions: {
    project: './tsconfig.json',
    requireConfigFile: false,
  },
  extends: [
    '@wavesenterprise/eslint-config/typescript-mixed',
  ],
  rules: {
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-redeclare': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
