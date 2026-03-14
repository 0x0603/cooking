# Shared

Shared libraries and packages used across projects.

## Structure

### ui-components/

Shared UI component library:

- Reusable React/Vue components
- Design system components
- Storybook documentation

### utils/

Utility functions and helpers:

- Date formatting
- String manipulation
- Validation functions
- API helpers

### configs/

Shared configurations:

- ESLint configs
- Prettier configs
- TypeScript configs
- Jest configs

## Usage

### In a project

```typescript
// Import shared utils
import { formatDate } from '@cooking/shared/utils'

// Import shared components
import { Button } from '@cooking/shared/ui-components'
```

### Publish as packages

Can be published to a private npm registry or used as local packages.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```
