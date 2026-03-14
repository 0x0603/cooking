/**
 * Shared Prettier config for all JS/TS projects.
 *
 * Usage in project's package.json:
 *   "prettier": "@cooking/configs/prettier.config.js"
 *
 * Or in project's .prettierrc.js:
 *   module.exports = require('../../shared/configs/prettier.config.js')
 */
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSpacing: true,
  jsxSingleQuote: false,
  proseWrap: 'preserve',
}
