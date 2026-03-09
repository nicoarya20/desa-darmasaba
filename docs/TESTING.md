# Testing Guide - Desa Darmasaba

## Overview

This document provides comprehensive testing guidelines for the Desa Darmasaba project. The project uses a multi-layered testing strategy including unit tests, component tests, and end-to-end (E2E) tests.

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Vitest | Testing utility functions, validation schemas, services |
| **Component Tests** | Vitest + React Testing Library | Testing React components in isolation |
| **E2E Tests** | Playwright | Testing complete user flows in real browsers |
| **API Mocking** | MSW (Mock Service Worker) | Mocking API responses for unit/component tests |

## Test Structure

```
__tests__/
├── api/                    # API integration tests
│   └── fileStorage.test.ts
├── components/             # Component tests
│   └── admin/
│       ├── UnifiedTypography.test.tsx
│       └── UnifiedSurface.test.tsx
├── e2e/                    # End-to-end tests
│   ├── admin/
│   │   └── auth.spec.ts
│   └── public/
│       └── pages.spec.ts
├── lib/                    # Unit tests for utilities
│   ├── validations.test.ts
│   ├── sanitizer.test.ts
│   └── whatsapp.test.ts
├── mocks/                  # MSW mocks for API
│   ├── handlers.ts
│   └── server.ts
└── setup.ts                # Test setup and configuration
```

## Running Tests

### All Tests
```bash
bun run test
```

### Unit Tests Only
```bash
bun run test:api
```

### E2E Tests Only
```bash
bun run test:e2e
```

### Tests with Coverage
```bash
bun run test:api --coverage
```

### Run Specific Test File
```bash
bunx vitest run __tests__/lib/validations.test.ts
```

### Run Tests in Watch Mode
```bash
bunx vitest
```

### Run E2E Tests with UI
```bash
bun run test:e2e --ui
```

## Writing Tests

### Unit Tests (Vitest)

Unit tests should test pure functions, validation schemas, and utilities in isolation.

```typescript
// __tests__/lib/example.test.ts
import { describe, it, expect } from 'vitest';
import { exampleFunction } from '@/lib/example';

describe('exampleFunction', () => {
  it('should return expected value for valid input', () => {
    const result = exampleFunction('valid-input');
    expect(result).toBe('expected-output');
  });

  it('should handle edge cases', () => {
    expect(() => exampleFunction('')).toThrow();
    expect(() => exampleFunction(null)).toThrow();
  });
});
```

### Component Tests (React Testing Library)

Component tests should test React components in isolation with mocked dependencies.

```typescript
// __tests__/components/Example.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ExampleComponent } from '@/components/Example';

function renderWithMantine(ui: React.ReactElement) {
  const theme = createTheme();
  return render(ui, {
    wrapper: ({ children }) => (
      <MantineProvider theme={theme}>{children}</MantineProvider>
    ),
  });
}

describe('ExampleComponent', () => {
  it('should render with props', () => {
    renderWithMantine(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const onClick = vi.fn();
    renderWithMantine(<ExampleComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests (Playwright)

E2E tests should test complete user flows in a real browser environment.

```typescript
// __tests__/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/starting-page');
  });

  test('should complete user flow', async ({ page }) => {
    // Fill form
    await page.fill('input[name="email"]', 'user@example.com');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/success');

    // Verify result
    await expect(page.getByText('Success!')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Submit invalid data
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.getByText('Validation error')).toBeVisible();
  });
});
```

### API Mocking (MSW)

Use MSW to mock API responses for unit and component tests.

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/example', () => {
    return HttpResponse.json({
      data: [{ id: '1', name: 'Item 1' }],
    });
  }),

  http.post('/api/example', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: '2', ...body },
      status: 201,
    });
  }),
];
```

## Test Coverage Goals

Current coverage thresholds (configured in `vitest.config.ts`):

| Metric | Target |
|--------|--------|
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |
| Statements | 50% |

### Critical Files Priority

Focus testing efforts on these critical files first:

1. **Validation & Security**
   - `src/lib/validations/index.ts`
   - `src/lib/sanitizer.ts`
   - `src/lib/whatsapp.ts`
   - `src/lib/session.ts`

2. **Core Utilities**
   - `src/lib/api-fetch.ts`
   - `src/lib/prisma.ts`
   - `src/utils/themeTokens.ts`

3. **Shared Components**
   - `src/components/admin/UnifiedTypography.tsx`
   - `src/components/admin/UnifiedSurface.tsx`
   - `src/components/admin/UnifiedCard.tsx`

4. **State Management**
   - `src/state/darkModeStore.ts`
   - `src/state/admin/*.ts`
   - `src/state/public/*.ts`

5. **API Routes**
   - `src/app/api/[[...slugs]]/_lib/auth/**`
   - `src/app/api/[[...slugs]]/_lib/desa/**`

## Testing Conventions

### Naming Conventions

- **Unit/Component Tests**: `*.test.ts` or `*.test.tsx`
- **E2E Tests**: `*.spec.ts`
- **Test Files**: Match source file name (e.g., `sanitizer.ts` → `sanitizer.test.ts`)
- **Test Directories**: Mirror source structure under `__tests__/`

### Describe Blocks

Use nested `describe` blocks to organize tests logically:

```typescript
describe('FeatureName', () => {
  describe('functionName', () => {
    describe('when valid input', () => {
      it('should return expected result', () => {});
    });

    describe('when invalid input', () => {
      it('should throw error', () => {});
    });
  });
});
```

### Test Descriptions

- Use clear, descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`
- Avoid vague descriptions like "works correctly"

### Assertions

- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Test both success and failure cases
- Test edge cases (empty input, null, undefined, max values)

### Setup and Teardown

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks, state
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  // ... tests
});
```

## Mocking Guidelines

### Mock External Services

```typescript
// Mock fetch API
global.fetch = vi.fn();

// Mock modules
vi.mock('@/lib/prisma', () => ({
  default: {
    berita: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));
```

### Mock Environment Variables

```typescript
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    TEST_VAR: 'test-value',
  };
});

afterEach(() => {
  process.env = originalEnv;
});
```

### Mock Date/Time

```typescript
const mockDate = new Date('2024-01-01T00:00:00Z');
vi.useFakeTimers();
vi.setSystemTime(mockDate);

// ... tests

vi.useRealTimers();
```

## E2E Testing Best Practices

### Test User Flows, Not Implementation

✅ Good:
```typescript
test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('input[name="nomor"]', '08123456789');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/admin/dashboard');
});
```

❌ Bad:
```typescript
test('login form submits to API', async ({ page }) => {
  // Don't test internal implementation details
});
```

### Use Data Attributes for Selectors

```typescript
// In component
<button data-testid="submit-button">Submit</button>

// In test
await page.getByTestId('submit-button').click();
```

### Handle Async Operations

```typescript
// Wait for specific element
await page.waitForSelector('.loaded-content');

// Wait for navigation
await page.waitForNavigation();

// Wait for network request
await page.waitForResponse('/api/data');
```

### Skip Tests Appropriately

```typescript
// Skip in CI
test.skip(process.env.CI === 'true', 'Skip in CI environment');

// Skip with reason
test.skip(true, 'Feature not yet implemented');

// Conditional skip
test.skip(!hasValidCredentials, 'Requires valid credentials');
```

## Continuous Integration

### GitHub Actions Workflow

Tests run automatically on:
- Pull requests
- Push to main branch
- Manual trigger

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Coverage should not decrease significantly

## Debugging Tests

### Vitest Debug Mode

```bash
bunx vitest --reporter=verbose
```

### Playwright Debug Mode

```bash
PWDEBUG=1 bun run test:e2e
```

### Playwright Trace Viewer

```bash
bun run test:e2e --trace on
bunx playwright show-trace
```

## Common Patterns

### Testing Validation Schemas

```typescript
describe('validationSchema', () => {
  it('should accept valid data', () => {
    const result = validationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid data', () => {
    const result = validationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('error message');
    }
  });
});
```

### Testing Async Functions

```typescript
it('should fetch data successfully', async () => {
  const result = await fetchData();
  expect(result).toEqual(expectedData);
});

it('should handle errors', async () => {
  await expect(asyncFunction()).rejects.toThrow('error message');
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.setValue('new value');
  });

  expect(result.current.value).toBe('new value');
});
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Check import paths, ensure `@/` alias is configured in `vitest.config.ts`

**Issue**: Mantine components throw errors
**Solution**: Wrap components with `MantineProvider` in test setup

**Issue**: Tests fail in CI but pass locally
**Solution**: Check for environment-specific code, use proper mocking

**Issue**: E2E tests timeout
**Solution**: Increase timeout, check for async operations, use proper waits

### Getting Help

- Check existing tests for patterns
- Review Vitest documentation: https://vitest.dev
- Review Playwright documentation: https://playwright.dev
- Review Testing Library documentation: https://testing-library.com

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io)
- [Testing JavaScript Course](https://testingjavascript.com)

## Maintenance

### Regular Tasks

- [ ] Update test dependencies monthly
- [ ] Review and update test coverage goals quarterly
- [ ] Remove deprecated test patterns
- [ ] Add tests for newly discovered edge cases
- [ ] Document common testing patterns

### Deprecation Policy

When refactoring code:
1. Keep existing tests passing
2. Update tests to match new implementation
3. Remove tests for removed functionality
4. Update this documentation

---

**Last Updated**: March 9, 2026
**Version**: 1.0.0
**Maintained By**: Development Team
