# Schema Architecture

This directory contains all Zod validation schemas organized by feature. This separation provides better maintainability, reusability, and type safety.

## Structure

```
schemas/
├── common.ts      # Shared schemas used across endpoints
├── track.ts       # Track endpoint validation
├── metrics.ts     # Metrics endpoint validation
├── auth.ts        # Authentication schemas
└── index.ts       # Central export with type inference
```

## Usage Examples

### In Route Handlers

```typescript
import { trackingPayloadSchema } from '../schemas'
import { zValidator } from '@hono/zod-validator'

// Clean, descriptive validation
app.post('/track', zValidator('json', trackingPayloadSchema), async (c) => {
  const payload = c.req.valid('json') // Fully typed!
  // ... business logic
})
```

### Type Inference

```typescript
import type { TrackingPayload, MetricsResponse } from '../schemas'

// Types are automatically generated from schemas
function processData(data: TrackingPayload): MetricsResponse {
  // TypeScript knows the exact shape
}
```

### Schema Composition

```typescript
import { dateRangeSchema, paginationSchema } from '../schemas'

// Reuse common schemas
const myQuerySchema = z.object({
  ...dateRangeSchema.shape,
  ...paginationSchema.shape,
  customField: z.string()
})
```

### Safe Validation

```typescript
import { safeValidate, trackingPayloadSchema } from '../schemas'

const result = safeValidate(trackingPayloadSchema, userInput)

if (result.success) {
  // result.data is fully typed
  console.log(result.data.user.id)
} else {
  // result.error has structured error info
  console.log(result.error.issues)
}
```

## Benefits

1. **Single Source of Truth**: Schemas define both validation and TypeScript types
2. **Reusability**: Common patterns like pagination, date ranges shared across endpoints
3. **Maintainability**: Changes to data structure require updates in one place
4. **Type Safety**: Automatic TypeScript type generation from runtime validation
5. **Better Testing**: Schemas can be unit tested independently
6. **Documentation**: Schema definitions serve as living API documentation

## Guidelines

- Keep schemas focused and cohesive
- Use composition over duplication
- Add JSDoc comments for complex validations
- Export both schemas and inferred types
- Test schemas independently of route handlers
