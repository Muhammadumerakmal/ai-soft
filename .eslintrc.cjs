module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    'no-console': 'warn',
    'complexity': ['warn', 10],
    'max-depth': ['warn', 3],
    'max-params': ['warn', 4],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts'],
      rules: {
        'no-console': 'off',
        'max-params': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules', 'dist', '.next', '*.js', '*.cjs'],
};
