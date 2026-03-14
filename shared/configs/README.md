# Shared Configs

Shared configuration files used across all projects for consistency.

## Available Configs

| Config     | File                 | Purpose                     |
| ---------- | -------------------- | --------------------------- |
| Prettier   | `prettier.config.js` | Code formatting rules       |
| ESLint     | `eslint.base.js`     | Linting rules (base config) |
| TypeScript | `tsconfig.base.json` | TypeScript compiler options |

## Usage

### Prettier

In your project's `.prettierrc.js`:

```js
module.exports = require('../../shared/configs/prettier.config.js')
```

### ESLint

In your project's `.eslintrc.json`:

```json
{
  "extends": ["../../shared/configs/eslint.base.js"]
}
```

### TypeScript

In your project's `tsconfig.json`:

```json
{
  "extends": "../../shared/configs/tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Overriding

All shared configs serve as a base. Projects can extend and override any rule:

```json
{
  "extends": ["../../shared/configs/eslint.base.js"],
  "rules": {
    "no-console": "off"
  }
}
```
