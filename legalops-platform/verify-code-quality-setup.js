#!/usr/bin/env node

/**
 * Verification script for code quality tooling setup
 * Run with: node verify-code-quality-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'ESLint config',
    path: 'eslint.config.mjs',
    required: true,
  },
  {
    name: 'Prettier config',
    path: '.prettierrc.json',
    required: true,
  },
  {
    name: 'Prettier ignore',
    path: '.prettierignore',
    required: true,
  },
  {
    name: 'lint-staged config',
    path: '.lintstagedrc.json',
    required: true,
  },
  {
    name: 'Husky pre-commit hook',
    path: '.husky/pre-commit',
    required: true,
  },
  {
    name: 'VS Code settings',
    path: '.vscode/settings.json',
    required: false,
  },
  {
    name: 'VS Code extensions',
    path: '.vscode/extensions.json',
    required: false,
  },
  {
    name: 'Code quality documentation',
    path: 'CODE_QUALITY.md',
    required: false,
  },
];

console.log('🔍 Verifying Code Quality Tooling Setup\n');

let allPassed = true;
let requiredPassed = true;

checks.forEach((check) => {
  const filePath = path.join(__dirname, check.path);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${check.name}: Found`);
  } else {
    const symbol = check.required ? '❌' : '⚠️';
    console.log(`${symbol} ${check.name}: Missing`);
    allPassed = false;
    if (check.required) {
      requiredPassed = false;
    }
  }
});

console.log('\n📦 Checking Dependencies\n');

const packageJson = require('./package.json');
const requiredDeps = {
  husky: 'devDependencies',
  'lint-staged': 'devDependencies',
  prettier: 'devDependencies',
  eslint: 'devDependencies',
};

Object.entries(requiredDeps).forEach(([dep, type]) => {
  if (packageJson[type] && packageJson[type][dep]) {
    console.log(`✅ ${dep}: ${packageJson[type][dep]}`);
  } else {
    console.log(`❌ ${dep}: Missing from ${type}`);
    requiredPassed = false;
  }
});

console.log('\n📝 Checking Scripts\n');

const requiredScripts = [
  'lint',
  'lint:fix',
  'format',
  'format:check',
  'prepare',
];

requiredScripts.forEach((script) => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`❌ ${script}: Missing`);
    requiredPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (requiredPassed) {
  console.log('✅ All required checks passed!');
  console.log('\n📚 Next steps:');
  console.log('1. Run: npm install (if not already done)');
  console.log('2. Run: npm run lint (to check for issues)');
  console.log('3. Run: npm run format (to format code)');
  console.log('4. Try committing a file to test the pre-commit hook');
  console.log('\n📖 See CODE_QUALITY.md for full documentation');
  process.exit(0);
} else {
  console.log('❌ Some required checks failed!');
  console.log('\n🔧 To fix:');
  console.log('1. Ensure all dependencies are installed: npm install');
  console.log('2. Re-run this script to verify');
  process.exit(1);
}
