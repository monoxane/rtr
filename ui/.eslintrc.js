module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'max-len': ['off'],
    'import/extensions': ['off'],
    'no-underscore-dangle': ['off'],
    'react/no-unstable-nested-components': [
      'warn',
      { allowAsProps: true },
    ],
  },
};
