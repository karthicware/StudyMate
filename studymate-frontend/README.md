# StudymateFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
