#!/usr/bin/env node
/**
 * E2E Endpoint Validation Script
 *
 * Validates that E2E tests use correct backend API endpoint patterns.
 * Prevents common mistakes like using `/api/v1/auth/login` instead of `/auth/login`.
 *
 * Usage:
 *   npm run validate:e2e-endpoints
 *
 * Exit codes:
 *   0 - All endpoints valid
 *   1 - Found invalid endpoint patterns
 */

const fs = require('fs');
const path = require('path');

// Backend API endpoint patterns
const ENDPOINT_PATTERNS = {
  // Pattern A: No prefix (5 controllers)
  patternA: {
    name: 'Pattern A (No Prefix)',
    prefix: '',
    endpoints: [
      '/auth/login',
      '/auth/register',
      '/auth/owner/register',
      '/auth/logout',
      '/auth/me',
      '/owner/halls/{hallId}/amenities',
      '/owner/seats/status/{hallId}',
      '/owner/users',
      '/owner/users/{userId}',
      '/owner/profile'
    ]
  },

  // Pattern B: /api prefix (2 controllers)
  patternB: {
    name: 'Pattern B (/api Prefix)',
    prefix: '/api',
    endpoints: [
      '/api/owner/settings',
      '/api/users',
      '/api/users/{id}'
    ]
  },

  // Pattern C: /api/v1 prefix (4 controllers)
  patternC: {
    name: 'Pattern C (/api/v1 Prefix)',
    prefix: '/api/v1',
    endpoints: [
      '/api/v1/owner/dashboard/{hallId}',
      '/api/v1/owner/seats/config/{hallId}',
      '/api/v1/owner/shifts/config/{hallId}',
      '/api/v1/owner/reports/{hallId}'
    ]
  }
};

// Common mistakes to detect
const COMMON_MISTAKES = [
  {
    pattern: /['"`]\/api\/v1\/auth\//,
    message: 'Authentication endpoints should NOT include /api/v1 prefix (Pattern A)',
    suggestion: 'Use /auth/* instead of /api/v1/auth/*'
  },
  {
    pattern: /['"`]\/api\/auth\//,
    message: 'Authentication endpoints should NOT include /api prefix (Pattern A)',
    suggestion: 'Use /auth/* instead of /api/auth/*'
  },
  {
    pattern: /['"`]\/api\/v1\/owner\/halls\/.*\/amenities/,
    message: 'Hall amenities endpoint should NOT include /api/v1 prefix (Pattern A)',
    suggestion: 'Use /owner/halls/{hallId}/amenities instead of /api/v1/owner/halls/{hallId}/amenities'
  },
  {
    pattern: /['"`]\/owner\/seats\/config\//,
    message: 'Seat configuration endpoint MUST include /api/v1 prefix (Pattern C)',
    suggestion: 'Use /api/v1/owner/seats/config/{hallId} instead of /owner/seats/config/{hallId}'
  },
  {
    pattern: /['"`]\/owner\/dashboard\//,
    message: 'Dashboard endpoint MUST include /api/v1 prefix (Pattern C)',
    suggestion: 'Use /api/v1/owner/dashboard/{hallId} instead of /owner/dashboard/{hallId}'
  },
  {
    pattern: /['"`]\/owner\/shifts\/config\//,
    message: 'Shift configuration endpoint MUST include /api/v1 prefix (Pattern C)',
    suggestion: 'Use /api/v1/owner/shifts/config/{hallId} instead of /owner/shifts/config/{hallId}'
  }
];

function findE2EFiles() {
  const e2eDir = path.join(__dirname, '..', 'e2e');
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
  }

  walkDir(e2eDir);
  return files;
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // Check for common mistakes
  COMMON_MISTAKES.forEach(({ pattern, message, suggestion }) => {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        errors.push({
          file: path.relative(process.cwd(), filePath),
          line: index + 1,
          content: line.trim(),
          message,
          suggestion
        });
      }
    });
  });

  return { errors, warnings };
}

function main() {
  console.log('🔍 Validating E2E test endpoint patterns...\n');

  const files = findE2EFiles();
  console.log(`Found ${files.length} E2E test files\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const { errors, warnings } = validateFile(file);

    if (errors.length > 0) {
      console.log(`\n❌ ${path.relative(process.cwd(), file)}`);
      errors.forEach(error => {
        console.log(`   Line ${error.line}: ${error.message}`);
        console.log(`   Found: ${error.content}`);
        console.log(`   Fix:   ${error.suggestion}\n`);
        totalErrors++;
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  ${path.relative(process.cwd(), file)}`);
      warnings.forEach(warning => {
        console.log(`   Line ${warning.line}: ${warning.message}`);
        console.log(`   Found: ${warning.content}\n`);
        totalWarnings++;
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Validation Summary');
  console.log('='.repeat(70));

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('✅ All endpoint patterns are valid!\n');
    console.log('📚 Backend API Patterns:');
    console.log('   • Pattern A (No Prefix): /auth/*, /owner/halls/*, /owner/seats/*, etc.');
    console.log('   • Pattern B (/api): /api/owner/settings, /api/users');
    console.log('   • Pattern C (/api/v1): /api/v1/owner/dashboard/*, /api/v1/owner/seats/config/*');
    console.log('\n📖 See: docs/api/backend-endpoint-reference.md for complete reference\n');
    process.exit(0);
  } else {
    if (totalErrors > 0) {
      console.log(`❌ Found ${totalErrors} error(s)`);
    }
    if (totalWarnings > 0) {
      console.log(`⚠️  Found ${totalWarnings} warning(s)`);
    }
    console.log('\n📖 See: docs/api/backend-endpoint-reference.md for correct endpoint patterns\n');
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error('❌ Validation script failed:', error.message);
  process.exit(1);
}
