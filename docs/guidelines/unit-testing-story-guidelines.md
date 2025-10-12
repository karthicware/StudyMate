# Unit Testing & Story Acceptance Guidelines

## 🧪 Unit & Story Testing Best Practices

### General Requirements
- [ ] Comprehensive Testing: Every story must include detailed testing requirements.
- [ ] Database Validation: All DB operations in AC/story must be validated via PostgreSQL MCP server.
- [ ] Coverage: Tests must cover functionality, security, and error scenarios.
- [ ] Compliance: Testing compliance validated at multiple stages.
- [ ] 90%+ Compliance: All stories must achieve at least 90% compliance with testing requirements.
- [ ] No Critical Gaps: No story can be marked "Done" with missing critical testing elements.
- [ ] Evidence: All testing must provide verifiable evidence of completion.

### Database/Entity/Migration Stories
- [ ] Playwright AC Validation: Every AC validated with Playwright, including browser console check.
- [ ] AC Report: For each AC, report pass/fail status. If fail, Playwright must take a screenshot and reference it in the report.
- [ ] No Console Errors: Browser console must be error/warning free for each AC.

---

## 🎨 Visual Quality Checklist
- [ ] Design System: Tailwind CSS compliance (refer to [docs/guidelines/airbnb-inspired-design-system.md](../guidelines/airbnb-inspired-design-system.md)).
- [ ] S-Tier SaaS: Adherence to top SaaS standards.
- [ ] Animations: Smooth animations and micro-interactions.
- [ ] Consistency: Consistent spacing and typography.

---

## 🔗 Integration Stories

### Mandatory Requirements
- [ ] End-to-End Testing: Complete business workflows tested.
- [ ] Cross-System Validation: Data consistency across integrated systems.
- [ ] Error Propagation: Error handling across system boundaries.
- [ ] Performance: System performance under integrated load.
- [ ] Third-party Integration: External service integration validated.
- [ ] Rollback: System recovery from integration failures.

### Integration Testing Framework
1. Unit Integration: Component-to-component interactions.
2. Service Integration: Service-to-service communication.
3. System Integration: Complete system workflow testing.
4. External Integration: Third-party service integration.
5. Data Integration: Cross-system data consistency validation.