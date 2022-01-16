module.exports = {
  root: true,
  plugins: [
    'react', 
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // General
    'indent': ['warn', 2],
    'linebreak-style': ['error', 'unix'],
    'eol-last': ['warn', 'always'],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'always-multiline'],
    'react/jsx-closing-bracket-location': ['warn', 'tag-aligned'],
    'arrow-parens': ['warn', 'as-needed'],
    'object-curly-spacing': ['warn', 'always', {
      arraysInObjects: false,
      objectsInObjects: false,
    }],
    'array-bracket-spacing': ['warn', 'never'],

    // Testing
    'jest/no-mocks-import': 'off',
    'testing-library/no-wait-for-multiple-assertions': 'off',
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
