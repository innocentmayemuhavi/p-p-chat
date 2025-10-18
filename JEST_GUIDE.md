# Jest Testing Configuration Guide

## Overview

This project is configured with Jest for testing both the frontend (React + TypeScript) and the backend (Node.js) server.

## Installation

Install all dependencies (both frontend and server):

```bash
npm install
# or
yarn install
```

## Running Tests

### All Tests (Frontend + Server)

Run tests for both frontend and server simultaneously:

```bash
npm test
# or
yarn test
```

Run all tests in watch mode:

```bash
npm run test:watch
# or
yarn test:watch
```

### Frontend Tests Only

Run tests for the frontend:

```bash
npm run test:client
# or
yarn test:client
```

Run frontend tests in watch mode:

```bash
npm run test:client:watch
# or
yarn test:client:watch
```

### Server Tests Only

Run tests for the server:

```bash
npm run test:server
# or
yarn test:server
```

Run server tests in watch mode:

```bash
npm run test:server:watch
# or
yarn test:server:watch
```

Or navigate to the server directory:

```bash
cd server
npm test
# or
yarn test
```

## Test Structure

### Frontend Tests

- Location: `src/**/__tests__/` or `src/**/*.test.tsx` or `src/**/*.spec.tsx`
- Environment: jsdom (simulates browser environment)
- Utilities: React Testing Library, Jest DOM

Example test:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

### Server Tests

- Location: `server/__tests__/` or `server/**/*.test.js` or `server/**/*.spec.js`
- Environment: node
- Type: ES Modules

Example test:

```javascript
import { describe, it, expect } from "@jest/globals";
import myFunction from "../myModule.js";

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

## Configuration Files

### Frontend: `jest.config.ts`

- Preset: ts-jest
- Test environment: jsdom
- Setup file: `jest.setup.ts`
- Module name mapper for CSS and assets
- Coverage collection from `src/` directory

### Server: `server/jest.config.js`

- Test environment: node
- ES Modules support
- Coverage collection excluding node_modules

## Coverage Reports

Coverage reports are generated in the `coverage/` directory.

View coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## Best Practices

1. **File Naming**: Use `.test.tsx` or `.spec.tsx` for test files
2. **Test Organization**: Group related tests in `describe` blocks
3. **Test Isolation**: Each test should be independent
4. **Mocking**: Use Jest mocks for external dependencies
5. **Assertions**: Use specific matchers from `@testing-library/jest-dom`

## Common Testing Patterns

### Testing React Components

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Test rendering
it("renders component", () => {
  render(<MyComponent />);
});

// Test user interactions
it("handles clicks", async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  await user.click(screen.getByRole("button"));
});

// Test async behavior
it("loads data", async () => {
  render(<MyComponent />);
  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
});
```

### Testing API Calls

```tsx
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

it("fetches data", async () => {
  mockedAxios.get.mockResolvedValue({ data: { id: 1 } });
  // Test your component or function
});
```

### Testing Context

```tsx
import { render } from "@testing-library/react";
import { MyContext } from "../context/MyContext";

it("uses context", () => {
  render(
    <MyContext.Provider value={mockValue}>
      <MyComponent />
    </MyContext.Provider>
  );
});
```

## Troubleshooting

### ESM Issues

If you encounter ES Module issues, ensure:

- `"type": "module"` is in package.json
- Use `.js` extensions in imports
- Run with `--experimental-vm-modules` flag (already configured for server)

### TypeScript Issues

- Check `tsconfig.json` includes test files
- Ensure `@types/jest` is installed
- Verify jest.config.ts transform settings

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
