module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    'no-unused-vars': 'error',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['return', 'block', 'block-like'],
      },
    ],
    '@typescript-eslint/ban-ts-ignore': 'off',
    "max-len": [
      "error",
      {
        "code": 120,
        "tabWidth": 2,
        "ignoreUrls": true,
        "ignorePattern": "^import\\s.+\\sfrom\\s.+;$",
      },
    ],
  }
};
