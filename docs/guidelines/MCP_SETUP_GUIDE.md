# MCP Server Setup Guide

This guide contains step-by-step instructions for setting up MCP (Model Context Protocol) servers in a new Claude Code project.

## Playwright MCP Server

The Playwright MCP server enables browser automation and web scraping capabilities.

### Installation Steps:

1. **Install Playwright test package:**
   ```bash
   npm install @playwright/test
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Install Chromium browser (if needed separately):**
   ```bash
   npx playwright install chromium
   ```

4. **Add to Claude MCP configuration:**
   ```bash
   claude mcp add playwright npx @playwright/mcp@latest
   ```

### Verification:
- Test the MCP server: `npx @playwright/mcp@latest`
- Should start without errors (exit code 0)

---

## Shadcn-UI MCP Server

The Shadcn-UI MCP server provides access to shadcn/ui components and documentation.

### Configuration:

Add the following configuration to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the shadcn-ui-react configuration to the mcpServers object

```json
{
  "/Users/natarajan/Documents/Projects/<project_folder_name>": {
    "mcpServers": {
      "shadcn-ui-react": {
        "command": "npx",
        "args": [
          "@jpisnice/shadcn-ui-mcp-server",
          "--framework",
          "react",
          "--github-api-key",
          "YOUR_GITHUB_PAT_HERE"
        ]
      }
    }
  }
}
```

### Verification:
- Restart Claude Code completely
- Run `/mcp` to verify the shadcn-ui-react server is listed
- Test functionality with shadcn-ui related commands

---

## Context7 MCP Server

The Context7 MCP server provides up-to-date documentation and code examples for libraries.

### Configuration:

Add the following to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the context7 configuration to the mcpServers object

```json
"context7": {
  "type": "http",
  "url": "https://mcp.context7.com/mcp"
}
```

---

## 21st.dev Magic MCP Server

The 21st.dev Magic MCP server provides AI-powered UI component generation and refinement.

### Configuration:

Add the following to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the @21st-dev/magic configuration to the mcpServers object

```json
"@21st-dev/magic": {
  "command": "npx",
  "args": [
    "-y",
    "@21st-dev/magic@0.1.0",
    "API_KEY=\"d512e37c7190060440ae69e97e194275d06dd820c5470b7b5ae8ac7d9a34f657\""
  ]
}
```

---

## BrowserMCP Server

The BrowserMCP server enables browser automation capabilities.

### Configuration:

Add the following to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the browsermcp configuration to the mcpServers object

```json
"browsermcp": {
  "command": "npx",
  "args": [
    "@browsermcp/mcp@latest"
  ]
}
```

---

## PostgreSQL MCP Server

The PostgreSQL MCP server provides database connectivity and query capabilities.

### Configuration:

Add the following to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the postgres configuration to the mcpServers object

```json
"postgres": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://<username>:<password>@host:5432/<project_folder_name>"
  ]
}
```

**Note:** Update the connection string with your actual database credentials and host information. Replace `<project_folder_name>` with your current project folder name.

---

## Serena MCP Server

The Serena MCP server provides advanced code analysis and semantic search capabilities.

### Prerequisites:

1. **Install uvx (if not already installed):**
   ```bash
   pip install uvx
   ```

### Configuration:

Add the following to your Claude Code project configuration file (`/Users/natarajan/.claude.json`):

**Steps:**
1. Find your current project folder location in the `.claude.json` file
2. Locate the `"mcpServers"` field within that project path
3. Add the serena configuration to the mcpServers object

```json
"serena": {
  "type": "stdio",
  "command": "uvx",
  "args": [
    "--from",
    "git+https://github.com/oraios/serena",
    "serena",
    "start-mcp-server",
    "--context",
    "ide-assistant",
    "--project",
    "/Users/natarajan/Documents/Projects/<project_folder_name>"
  ],
  "env": {}
}
```

**Note:** Update the project path to match your actual project directory. Replace `<project_folder_name>` with your current project folder name.

---