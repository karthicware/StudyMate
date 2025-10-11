# 🖥️ VS Code Setup Guide

## Overview
This guide helps you configure Visual Studio Code for optimal development experience with the StudyMate project, covering both Angular frontend and Spring Boot backend development.

---

## 📋 Quick Start

### 1. Install VS Code
Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)

### 2. Open Project
```bash
cd /path/to/studyhall
code .
```

### 3. Install Recommended Extensions
When you open the project, VS Code will prompt you to install recommended extensions.

**Or manually:**
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type: **"Extensions: Show Recommended Extensions"**
3. Click **"Install All"**

---

## 🔌 Required Extensions

### Core Extensions (Must Install)

#### Java & Spring Boot
- **Extension Pack for Java** (`vscjava.vscode-java-pack`)
  - Includes Java language support, debugger, test runner, Maven
- **Spring Boot Extension Pack** (`vmware.vscode-spring-boot`)
  - Spring Boot tools, dashboard, and Initializr
- **Language Support for Java** (`redhat.java`)
  - Code navigation, IntelliSense, refactoring

#### Angular & TypeScript
- **Angular Language Service** (`angular.ng-template`)
  - Template IntelliSense, error checking
- **ESLint** (`dbaeumer.vscode-eslint`)
  - JavaScript/TypeScript linting
- **Prettier** (`esbenp.prettier-vscode`)
  - Code formatting

#### Tailwind CSS
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
  - Autocomplete, syntax highlighting, linting

#### Database
- **PostgreSQL** (`ckolkman.vscode-postgres`)
  - Connect to and query PostgreSQL
- **SQLTools** (`mtxr.sqltools`)
  - Database management and SQL execution

---

## ⚙️ Configuration Files

The project includes pre-configured VS Code settings:

```
.vscode/
├── settings.json       # Workspace settings
├── extensions.json     # Recommended extensions
└── launch.json         # Debug configurations

studymate-frontend/.vscode/
├── settings.json       # Frontend-specific settings
├── extensions.json     # Frontend extensions
├── launch.json         # Angular debug configs
└── tasks.json          # Build tasks

studymate-backend/.vscode/
├── settings.json       # Backend-specific settings
└── extensions.json     # Backend extensions
```

---

## 🚀 Features Configured

### ✅ Format on Save
Code automatically formats when you save files:
- Java: Google Java Style
- TypeScript/JavaScript: Prettier
- HTML/CSS: Prettier

### ✅ Auto-Fix on Save
ESLint automatically fixes issues:
- Import organization
- Missing semicolons
- Code style violations

### ✅ IntelliSense
Smart code completion for:
- Java classes and methods
- Spring Boot annotations
- Angular components and directives
- Tailwind CSS classes
- TypeScript types

### ✅ Debugging
Pre-configured debug launches for:
- Angular app (Chrome/Edge)
- Spring Boot application
- JUnit tests
- Playwright E2E tests
- Full-stack debugging (both simultaneously)

---

## 🐛 Debugging Guide

### Debug Frontend (Angular)

**Method 1: Using Debug Panel**
1. Click Run and Debug icon (or `Cmd+Shift+D`)
2. Select "🎨 Frontend: ng serve (Chrome)"
3. Press F5 or click green play button

**Method 2: Attach to Running App**
1. Start Angular: `cd studymate-frontend && npm start`
2. Select "🎨 Frontend: Attach to Chrome"
3. Press F5

**Set Breakpoints:**
- Click left of line number in `.ts` files
- Breakpoint will pause execution
- Inspect variables in Debug panel

### Debug Backend (Spring Boot)

**Method 1: Launch from VS Code**
1. Open Run and Debug panel
2. Select "☕ Backend: Spring Boot (Maven)"
3. Press F5

**Method 2: Attach to Running Process**
1. Start Spring Boot with debug enabled:
   ```bash
   cd studymate-backend
   ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
   ```
2. Select "☕ Backend: Attach to Process"
3. Press F5

**Set Breakpoints:**
- Click left of line number in `.java` files
- Application will pause at breakpoint
- Step through code with F10 (step over) / F11 (step into)

### Debug Full Stack

**Launch both simultaneously:**
1. Select "🚀 Full Stack: Debug All"
2. Press F5
3. Both frontend and backend will start with debugging enabled

---

## 🧪 Running Tests

### Frontend Tests (Angular)

**Unit Tests (Karma/Jasmine):**
```bash
cd studymate-frontend
npm test
```

**E2E Tests (Playwright):**
```bash
cd studymate-frontend
npx playwright test
```

**From VS Code:**
- Open Command Palette
- Type: "Test: Run All Tests"

### Backend Tests (JUnit)

**Run All Tests:**
```bash
cd studymate-backend
./mvnw test
```

**Run Specific Test:**
- Right-click on test class/method
- Select "Run Test" or "Debug Test"

**From VS Code:**
- Click "Run Test" / "Debug Test" above test methods
- Or use Testing panel (beaker icon in sidebar)

---

## 📝 Code Snippets

VS Code includes shortcuts for common code patterns:

### Java/Spring Boot Snippets

| Prefix | Description |
|--------|-------------|
| `class` | Create Java class |
| `ctor` | Constructor |
| `main` | Main method |
| `sout` | System.out.println |
| `@RestController` | REST controller class |
| `@GetMapping` | GET endpoint method |
| `@PostMapping` | POST endpoint method |
| `@Autowired` | Dependency injection |

### Angular/TypeScript Snippets

| Prefix | Description |
|--------|-------------|
| `a-component` | Angular component |
| `a-service` | Angular service |
| `a-pipe` | Angular pipe |
| `a-directive` | Angular directive |
| `a-guard` | Route guard |
| `ngFor` | *ngFor directive |
| `ngIf` | *ngIf directive |

---

## 🎨 Tailwind CSS IntelliSense

### Features

**Autocomplete:**
- Start typing class names in HTML
- Get suggestions for all Tailwind classes

**Hover Preview:**
- Hover over Tailwind class
- See actual CSS generated

**Color Preview:**
- Shows color swatches inline
- For classes like `bg-blue-500`

**Linting:**
- Warns about invalid class names
- Suggests corrections

### Usage Example
```html
<!-- Type "bg-" and see all background color options -->
<div class="bg-blue-500 text-white p-4">
  Hello World
</div>
```

---

## 📦 PostgreSQL Integration

### Connect to Database

**Using PostgreSQL Extension:**
1. Click PostgreSQL icon in sidebar
2. Click "+" to add connection
3. Enter details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `studymate`
   - Username: `studymate_user`
   - Password: `studymate_user`
4. Click "Connect"

**Using SQLTools:**
1. Click SQLTools icon
2. Add new connection → PostgreSQL
3. Same credentials as above
4. Test and save connection

### Run SQL Queries
- Open `.sql` file
- Right-click → "Run Query"
- Or use `Cmd+E Cmd+E` / `Ctrl+E Ctrl+E`

---

## 🔧 Keyboard Shortcuts

### General

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+P` | Quick file open |
| `Cmd/Ctrl+Shift+P` | Command palette |
| `Cmd/Ctrl+B` | Toggle sidebar |
| `Cmd/Ctrl+J` | Toggle terminal |
| `Cmd/Ctrl+Shift+F` | Search in files |
| `Cmd/Ctrl+Shift+H` | Replace in files |

### Editing

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+/` | Toggle comment |
| `Alt+Up/Down` | Move line up/down |
| `Shift+Alt+Up/Down` | Copy line up/down |
| `Cmd/Ctrl+D` | Select next occurrence |
| `Cmd/Ctrl+F2` | Select all occurrences |
| `Cmd/Ctrl+Shift+L` | Select all occurrences |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Go to line |
| `Cmd/Ctrl+Click` | Go to definition |
| `Alt+Left/Right` | Navigate back/forward |
| `F12` | Go to definition |
| `Shift+F12` | Find all references |

### Debugging

| Shortcut | Action |
|----------|--------|
| `F5` | Start debugging |
| `F9` | Toggle breakpoint |
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `Shift+F5` | Stop debugging |

---

## 🛠️ Troubleshooting

### Java Extension Issues

**Problem:** Java extension not activating
```bash
Solution:
1. Cmd+Shift+P → "Java: Clean Java Language Server Workspace"
2. Reload VS Code
3. Verify JAVA_HOME is set correctly
```

**Problem:** Maven not recognized
```bash
Solution:
1. Verify Maven is installed: mvn --version
2. Set maven.executable.path in settings
3. Or use Maven wrapper: ./mvnw
```

### Angular Extension Issues

**Problem:** Angular Language Service not working
```bash
Solution:
1. Cmd+Shift+P → "Angular: Restart Language Service"
2. Check TypeScript version matches Angular requirements
3. Delete node_modules and npm install
```

**Problem:** ESLint not auto-fixing
```bash
Solution:
1. Check .eslintrc.json exists
2. Verify ESLint extension is enabled
3. Check settings: "editor.codeActionsOnSave"
```

### Debugging Issues

**Problem:** Breakpoints not hitting (Java)
```bash
Solution:
1. Ensure source maps are enabled
2. Check debug configuration matches running process
3. Verify port 5005 is not in use
4. Clean and rebuild: ./mvnw clean install
```

**Problem:** Can't debug Angular app
```bash
Solution:
1. Ensure Angular dev server is running
2. Check port 4200 is accessible
3. Verify sourceMaps: true in tsconfig.json
4. Try Chrome with --remote-debugging-port=9222
```

---

## 🌟 Productivity Tips

### Multi-Root Workspace

Work on frontend and backend simultaneously:

```bash
# Open both as separate roots
code studymate-frontend studymate-backend
```

Or create `studyhall.code-workspace`:
```json
{
  "folders": [
    { "path": "studymate-frontend" },
    { "path": "studymate-backend" }
  ]
}
```

### Split Editing

- `Cmd/Ctrl+\` - Split editor
- `Cmd/Ctrl+1/2/3` - Focus editor group
- Drag tabs between groups

### Terminal Management

- `Cmd/Ctrl+Shift+` ` - New terminal
- `Cmd/Ctrl+Shift+5` - Split terminal
- Terminal dropdown to switch between shells

### Task Runner

Use integrated task runner:
- `Cmd/Ctrl+Shift+B` - Run build task
- Tasks defined in `.vscode/tasks.json`

---

## 🔗 Additional Resources

### Official Documentation
- [VS Code Java](https://code.visualstudio.com/docs/languages/java)
- [VS Code TypeScript](https://code.visualstudio.com/docs/languages/typescript)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

### Extension Documentation
- [Spring Boot Tools](https://github.com/spring-projects/sts4)
- [Angular Language Service](https://angular.io/guide/language-service)
- [Tailwind CSS IntelliSense](https://github.com/tailwindlabs/tailwindcss-intellisense)

### Project Documentation
- [Coding Standards](./architecture/coding-standards.md)
- [Environment Setup](./environment-setup.md) *(Story 0.16)*
- [PostgreSQL Setup](./postgresql-setup.md) *(Story 0.18)*

---

## 📞 Getting Help

If you encounter issues:
1. Check this documentation
2. Review extension documentation
3. Check VS Code output panel (`Cmd/Ctrl+Shift+U`)
4. Ask team for assistance
5. File issue on project repository

---

## 🎯 IntelliJ IDEA Alternative

For Java developers preferring IntelliJ IDEA:

### Required Plugins
- Spring Boot
- Lombok (if used)
- Database Navigator
- GitToolBox

### Import Project
1. File → Open
2. Select `studymate-backend/pom.xml`
3. Open as Project
4. Enable annotation processing

### Run Configuration
1. Run → Edit Configurations
2. Add "Spring Boot" configuration
3. Main class: `com.studymate.backend.StudymateBackendApplication`
4. Active profiles: `dev`

### Angular Development
Use VS Code for frontend, IntelliJ for backend:
- VS Code: Better Angular/TypeScript support
- IntelliJ: Superior Java/Spring Boot support

---

**Last Updated:** October 2025
**Related Stories:** 0.17 (IDE Configuration Files)
