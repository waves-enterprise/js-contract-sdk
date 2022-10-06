module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],

  "rules": {
    "prettier/prettier": [
      "error",
      {
        "singleQuote": false,
      }
    ],
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
};
