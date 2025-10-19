# StudymateFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.

## Development server

**IMPORTANT**: Always use `npm start` (not `ng serve` directly) to ensure the proxy configuration is active.

```bash
# Start frontend with proxy configuration (connects to backend on port 8080)
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

**Before starting the frontend**, ensure the backend is running:

```bash
# In a separate terminal, start the backend
cd ../studymate-backend
./mvnw spring-boot:run
```

### Why use `npm start` instead of `ng serve`?

The `npm start` command includes the proxy configuration (`--proxy-config proxy.conf.json`) which routes API requests from the frontend (port 4200) to the backend (port 8080). Without the proxy, API calls will fail with connection errors.

For more details about environment configuration, see [Frontend Environment Configuration](../docs/architecture/frontend-environment-config.md).

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Code Quality

### Linting

This project uses ESLint with Angular-specific rules and Prettier for code formatting.

To run linting:
```bash
npm run lint
```

To automatically fix linting issues:
```bash
npm run lint:fix
```

### Formatting

To format all code files:
```bash
npm run format
```

To check if files are formatted correctly:
```bash
npm run format:check
```

### Pre-commit Hooks

The project uses Husky to run linting and formatting automatically before commits. All staged files will be linted and formatted when you run `git commit`.

### VS Code Setup

For the best development experience, install these VS Code extensions:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

The project includes VS Code settings that enable format-on-save and auto-fix for ESLint.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

This project uses **Playwright** for end-to-end testing with cross-browser support.

### Running E2E Tests

```bash
# Run tests in headless mode (CI)
npm run e2e

# Run tests with UI mode (interactive)
npm run e2e:ui

# Run tests with visible browser
npm run e2e:headed

# Run tests in debug mode
npm run e2e:debug

# View test report
npm run e2e:report
```

### Playwright MCP Integration

Playwright is configured with MCP (Model Context Protocol) support for browser automation. The following MCP tools are available through Claude Code:
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture accessibility snapshots
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type into inputs
- `mcp__playwright__browser_screenshot` - Take screenshots
- `mcp__playwright__browser_console_messages` - Get console logs

### Test Configuration

Playwright is configured to:
- Test on Chromium, Firefox, and WebKit browsers
- Automatically start the Angular dev server on port 4200
- Capture screenshots and videos on test failures
- Run in parallel for faster execution
- Retry failed tests in CI environments

See `playwright.config.ts` for full configuration details.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
