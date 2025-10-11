# context7 MCP Integration Guidelines for BMAD Agents (MANDATORY)

## Purpose
This document provides mandatory guidelines for all BMAD agents (Product Owner, Scrum Master, Developer) to ensure consistent use of context7 MCP throughout the story lifecycle - from generation to implementation.

## What is context7 MCP?

context7 is a Model Context Protocol (MCP) server that dynamically injects up-to-date, version-specific documentation and code examples directly into AI prompts. It eliminates outdated information and hallucinated APIs by fetching real-time documentation straight from official sources.

## Agent-Specific Guidelines

### Product Owner (PO) Agent Guidelines
When creating stories, epics, or PRDs:

1. **Feature Feasibility Verification**
   - Use context7 to verify that requested features are supported by current framework versions
   - Command: `"use context7 - check if [feature] is supported in [framework] latest version"`
   
2. **Technical Constraints Documentation**
   - Validate technical requirements against latest framework capabilities
   - Include version-specific limitations in acceptance criteria
   
3. **Story Technical Notes**
   - Add context7-verified implementation patterns to Dev Notes section
   - Reference specific documentation versions in story requirements

### Scrum Master (SM) Agent Guidelines
When managing stories and sprints:

1. **Story Validation**
   - Verify technical feasibility using context7 before sprint planning
   - Command: `"use context7 - validate [technology] supports [requirement]"`
   
2. **Dependency Management**
   - Check for breaking changes between versions during sprint planning
   - Document upgrade paths in sprint notes
   
3. **Risk Assessment**
   - Use context7 to identify deprecated features in current implementation
   - Flag version conflicts before they become blockers

### Developer (Dev) Agent Guidelines
When implementing stories:

1. **Pre-Implementation Checks** (MANDATORY)
   - Always consult context7 before writing any code
   - Command: `"use context7 - show latest [framework] patterns for [feature]"`
   
2. **Version-Specific Implementation**
   - Use only documented APIs for the project's framework versions
   - Avoid deprecated or experimental features unless explicitly approved
   
3. **Code Review Preparation**
   - Validate implementation against latest best practices
   - Document any deviations from standard patterns

### Core Benefits
- **Real-Time Documentation**: Access the latest official docs without tab-switching
- **Version-Specific Examples**: Get code examples accurate for your exact library version
- **Eliminates Hallucinations**: No more outdated or non-existent API references
- **Universal Compatibility**: Works with Claude Desktop, Cursor, Windsurf, and other MCP-compatible clients
- **Increased Productivity**: Stay focused in your editor with documentation delivered directly to your workflow

## How context7 Works

1. **Library Identification**: Detects the library being referenced in your prompt
2. **Documentation Fetching**: Retrieves the latest version from official documentation
3. **Context Injection**: Parses and injects relevant content into the AI's prompt context
4. **Accurate Response**: Returns version-accurate code examples and patterns

### Supported Documentation Sources
- **Frontend Frameworks**: Next.js, React, Vue, Angular, Svelte
- **UI Libraries**: Tailwind CSS, shadcn/ui, Material-UI, Ant Design
- **Backend Frameworks**: Spring Boot, Express, FastAPI, Django
- **Databases**: PostgreSQL, MongoDB, Redis, MySQL
- **Cloud Platforms**: AWS, Azure, Google Cloud, Vercel
- **DevOps Tools**: Docker, Kubernetes, GitHub Actions
- **Languages**: TypeScript, JavaScript, Python, Java, Go, Rust

## Story Generation & Implementation Workflow

### Phase 1: Story Creation (PO Agent)
```yaml
Requirements Gathering:
  - Consult context7 for feature availability
  - Verify framework support for requested functionality
  - Document version-specific requirements
  
Story Dev Notes Section:
  - Include: "Implementation must use context7-verified patterns"
  - Add: "Consult [framework] v[X.X] documentation via context7"
  - Reference: Specific API endpoints or methods from latest docs
```

### Phase 2: Story Refinement (SM Agent)
```yaml
Technical Validation:
  - Run: "use context7 - verify all story requirements are achievable"
  - Check: Dependencies and version compatibility
  - Update: Story with any technical constraints discovered
  
Sprint Planning:
  - Validate: All stories against current framework versions
  - Document: Required library updates in sprint notes
  - Flag: Any breaking changes that might affect timeline
```

### Phase 3: Story Implementation (Dev Agent)
```yaml
Before Coding:
  - MANDATORY: "use context7 - get latest [feature] implementation patterns"
  - Review: Version-specific documentation
  - Verify: All dependencies are compatible
  
During Implementation:
  - Reference: Only documented APIs from context7
  - Follow: Latest best practices from official docs
  - Avoid: Deprecated patterns flagged by context7
  
After Implementation:
  - Validate: Code against latest documentation
  - Document: Any version-specific implementations
  - Update: VERSIONS.md with any package changes
```

## Installation & Version Management Rules

### CRITICAL: Package Installation Protocol
Whenever installing or updating any package or dependency:

1. **Documentation Check** (MANDATORY)
   - First, ALWAYS check the latest documentation using context7 MCP
   - Command: `use context7` in your prompt when asking about installation

2. **Version Selection**
   - Always pick the latest stable version available
   - Verify compatibility with existing packages and tools
   - Check breaking changes in release notes

3. **Compatibility Verification**
   - Ensure the new version is compatible with all existing dependencies
   - Review peer dependency requirements
   - Test integration points with other systems

4. **Conflict Resolution**
   - If conflicts arise, use the last stable versions known to work together
   - Document why specific versions were chosen
   - Consider creating a compatibility matrix for critical dependencies

5. **Version Tracking**
   - Keep track of all installed versions in a changelog
   - Document upgrade paths and migration notes
   - Maintain a version history file: `VERSIONS.md`

### Example Installation Workflow
```bash
# 1. Check documentation via context7
# Prompt: "use context7 - install latest Next.js with App Router"

# 2. Verify compatibility
npm outdated  # Check current versions
npm ls       # Review dependency tree

# 3. Install with specific version
npm install next@latest react@latest react-dom@latest

# 4. Document in VERSIONS.md
echo "- Next.js: 14.2.x → 15.0.x (Date: YYYY-MM-DD)" >> VERSIONS.md
```

## BMAD Agent Workflow Integration

### Complete Story Lifecycle with context7

```
┌─────────────────────────────────────────────┐
│    BMAD Agent Story Generation Workflow     │
├─────────────────────────────────────────────┤
│ PO AGENT - Story Creation Phase             │
│  1. Feature Request Analysis                │
│  2. context7 Feasibility Check              │ ← MANDATORY
│     └─ Verify framework support             │
│  3. Generate Story with Tech Constraints    │
│     └─ Include version-specific notes       │
├─────────────────────────────────────────────┤
│ SM AGENT - Story Refinement Phase           │
│  4. Technical Validation                    │ ← MANDATORY
│     └─ "use context7" for capability check  │
│  5. Dependency Compatibility Review         │ ← MANDATORY
│     └─ Check for version conflicts          │
│  6. Update Story with Implementation Guide  │
│     └─ Add context7 reference commands      │
├─────────────────────────────────────────────┤
│ DEV AGENT - Implementation Phase            │
│  7. Pre-Implementation Documentation        │ ← MANDATORY
│     └─ "use context7" for latest patterns   │
│  8. Version Compatibility Check             │ ← MANDATORY
│     └─ Verify all dependencies work together│
│  9. Pattern Verification via context7       │ ← MANDATORY
│     └─ Validate against official examples   │
│  10. UI Planning with shadcn/ui MCP        │ ← MANDATORY
│     └─ Fetch component demos before coding  │
│  11. Implementation with Latest Patterns    │
│     └─ Use version-specific code examples   │
│  12. Code Review with context7 Validation   │ ← MANDATORY
│     └─ Ensure patterns match latest docs    │
│  13. Testing & Version Documentation        │
│     └─ Update VERSIONS.md with changes      │
└─────────────────────────────────────────────┘
```

### Story Template Integration
All BMAD-generated stories MUST include:

```markdown
## Dev Notes (Auto-generated by BMAD Agents)
- [ ] Consult context7 MCP for latest [framework] patterns before implementation
- [ ] Verify all dependencies are compatible using context7
- [ ] Use only documented APIs from official sources
- [ ] Update VERSIONS.md if any packages are added/updated
- [ ] Reference: "use context7 - [specific feature] implementation"
```

## Usage Examples

### Basic Usage
```
# In your AI prompt, simply add "use context7":
"How do I implement server actions in Next.js 14? use context7"
"Show me the latest PostgreSQL jsonb query patterns use context7"
"What's the new Tailwind CSS v4 configuration format? use context7"
```

### Framework-Specific Queries
```typescript
// Next.js App Router patterns
"use context7 - show me Next.js 14 parallel routes implementation"

// Spring Boot latest patterns
"use context7 - Spring Boot 3.2 security configuration with JWT"

// React 18 features
"use context7 - React 18 Suspense with streaming SSR"
```

## Enabled Technologies & Documentation Sources

### Frontend Stack
- **Next.js 14+**: App Router, Server Components, Server Actions, Parallel Routes
- **React 18+**: Concurrent features, Suspense, RSC, New hooks
- **TypeScript 5+**: Latest type features, decorators, satisfies operator
- **Tailwind CSS 3.4+**: Container queries, dynamic variants, CSS-in-JS alternatives
- **shadcn/ui**: Latest component patterns, themes, accessibility features

### Backend Stack
- **Spring Boot 3.2+**: Virtual threads, native compilation, observability
- **PostgreSQL 16+**: JSON/JSONB operations, window functions, CTEs
- **Redis 7+**: Streams, modules, clustering patterns
- **JWT/Security**: Latest security patterns and best practices

### Development Tools
- **Turborepo**: Monorepo optimization, caching strategies
- **PNPM**: Workspace management, dependency hoisting
- **ESLint 9+**: Flat config, custom rules
- **Playwright**: Component testing, API testing patterns

## Quality Gates & Compliance

### Mandatory Checks
1. **Documentation Currency**: All implementations must use latest documented patterns
2. **Version Alignment**: Dependencies must be on compatible, documented versions
3. **Pattern Consistency**: Code must follow official framework patterns
4. **Security Compliance**: Implement latest security best practices from official docs
5. **Performance Standards**: Apply latest optimization techniques from documentation

### Review Checklist
- [ ] Consulted context7 for latest documentation
- [ ] Verified version compatibility across dependencies
- [ ] Implemented patterns match official examples
- [ ] Updated VERSIONS.md with any package changes
- [ ] Validated against framework-specific best practices
- [ ] Confirmed no deprecated APIs are used

## BMAD Agent-Specific context7 Commands

### PO Agent Commands
```bash
# Feature feasibility checks
"use context7 - can Next.js 14 support [feature requirement]?"
"use context7 - latest Spring Boot capabilities for [use case]"
"use context7 - check PostgreSQL support for [data requirement]"

# Technical constraint discovery
"use context7 - limitations of [framework] for [feature]"
"use context7 - performance implications of [pattern]"
```

### SM Agent Commands
```bash
# Sprint planning validation
"use context7 - breaking changes between [framework] v[X] and v[Y]"
"use context7 - migration path from [old version] to [new version]"
"use context7 - deprecated features in [framework] latest"

# Risk assessment
"use context7 - known issues with [library] v[X.X]"
"use context7 - compatibility matrix for [tech stack]"
```

### Dev Agent Commands
```bash
# Pre-implementation research
"use context7 - latest [framework] patterns for [feature]"
"use context7 - best practices for [implementation pattern]"
"use context7 - official examples of [specific functionality]"

# Implementation guidance
"use context7 - [framework] API documentation for [method/class]"
"use context7 - recommended approach for [technical challenge]"
"use context7 - performance optimization for [component/query]"

# Version-specific queries
"use context7 - Spring Boot 3.2.0 security configuration"
"use context7 - Next.js 14 App Router patterns"
"use context7 - PostgreSQL 16 JSONB operations"
```

## Story Generation Examples with context7

### Example 1: PO Agent Creating Authentication Story
```yaml
Story Title: "Implement OAuth2 Social Login"
Before Writing Story:
  - Run: "use context7 - Next.js 14 OAuth implementation patterns"
  - Run: "use context7 - Spring Boot 3.2 OAuth2 configuration"
  
Dev Notes Generated:
  - "Implementation must follow Next.js 14 Auth.js patterns per context7"
  - "Backend must use Spring Security OAuth2 Resource Server"
  - "Reference: context7 verified OAuth flow documentation"
```

### Example 2: SM Agent Validating Story
```yaml
Story Review Process:
  - Check: "use context7 - verify NextAuth.js works with Spring Boot OAuth2"
  - Validate: "use context7 - production-ready OAuth2 patterns"
  - Add to Story: "IMPORTANT: Use context7 to verify OAuth provider setup"
```

### Example 3: Dev Agent Implementation
```yaml
Before Coding:
  - "use context7 - NextAuth.js latest configuration"
  - "use context7 - Spring Security OAuth2 JWT validation"
  
During Implementation:
  - Follow exact patterns from context7 documentation
  - Use only stable, documented APIs
  - Reference version-specific examples
```

## Enforcement & Compliance

### BMAD Agent Requirements
1. **PO Agent**: MUST include context7 verification in every story's Dev Notes
2. **SM Agent**: MUST validate technical feasibility using context7 before sprint commitment
3. **Dev Agent**: MUST consult context7 before ANY implementation begins

### Story Rejection Criteria
Stories will be automatically rejected if:
- Missing context7 verification notes in Dev Notes section
- Using deprecated patterns not validated by context7
- Installing packages without context7 documentation check
- Implementing features without referencing latest documentation

### Compliance Tracking
All BMAD agents must log context7 usage:
```markdown
## Context7 Verification Log
- [ ] Feature feasibility checked via context7
- [ ] Version compatibility verified
- [ ] Implementation patterns validated
- [ ] Documentation references included
- [ ] VERSIONS.md updated (if applicable)
```

## Troubleshooting

### Common Issues
1. **Outdated Patterns**: Always prefix queries with "use context7" to ensure latest docs
2. **Version Conflicts**: Check compatibility matrix before upgrading
3. **Missing Documentation**: Some niche libraries may not be indexed yet
4. **Rate Limiting**: Space out documentation requests if hitting limits

### BMAD Agent-Specific Issues
- **PO Agent**: If feature not supported, document alternative approaches using context7
- **SM Agent**: When conflicts found, create technical debt stories with context7 references
- **Dev Agent**: If pattern unclear, query multiple variations through context7

### Support Resources
- context7 GitHub: https://github.com/upstash/context7
- MCP Protocol Docs: https://modelcontextprotocol.org
- BMAD Agent Configuration: /.bmad-core/agents/
- Project Standards: /docs/architecture/coding-standards.md

---
*This guide is MANDATORY for all BMAD agents operating on the WallFramez project. Stories generated without context7 verification will be automatically rejected. All agents must follow these guidelines during story generation, refinement, and implementation phases.*
