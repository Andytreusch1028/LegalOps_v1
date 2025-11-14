/**
 * LegalOps v1 - Automated Code Review Script
 * Generates Sonnet 4.5-friendly code review report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  🔍 AUTOMATED CODE REVIEW');
console.log('  Analyzing LegalOps v1 Codebase');
console.log('========================================\n');

const report = {
  timestamp: new Date().toISOString(),
  sections: [],
  criticalIssues: [],
  warnings: [],
  suggestions: [],
  summary: {}
};

// Helper to run commands and capture output
function runCommand(command, description) {
  console.log(`\n[Running] ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    console.log(`✅ ${description} - Complete`);
    return { success: true, output };
  } catch (error) {
    console.log(`⚠️  ${description} - Issues Found`);
    return { success: false, output: error.stdout || error.stderr || error.message };
  }
}

// 1. TypeScript Type Checking
console.log('\n📋 STEP 1: TypeScript Type Checking');
const tscResult = runCommand('npx tsc --noEmit --pretty false', 'TypeScript Check');
if (!tscResult.success && tscResult.output) {
  const errors = tscResult.output.split('\n').filter(line => line.includes('error TS'));
  report.sections.push({
    name: 'TypeScript Errors',
    count: errors.length,
    issues: errors.slice(0, 20) // Limit to first 20
  });
  if (errors.length > 0) {
    report.criticalIssues.push(`Found ${errors.length} TypeScript type errors`);
  }
}

// 2. ESLint Code Quality
console.log('\n📋 STEP 2: ESLint Code Quality Check');
const eslintResult = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --format json', 'ESLint Check');
if (eslintResult.output) {
  try {
    const eslintData = JSON.parse(eslintResult.output);
    const errorCount = eslintData.reduce((sum, file) => sum + file.errorCount, 0);
    const warningCount = eslintData.reduce((sum, file) => sum + file.warningCount, 0);
    
    report.sections.push({
      name: 'ESLint Issues',
      errors: errorCount,
      warnings: warningCount
    });
    
    if (errorCount > 0) {
      report.criticalIssues.push(`Found ${errorCount} ESLint errors`);
    }
    if (warningCount > 0) {
      report.warnings.push(`Found ${warningCount} ESLint warnings`);
    }
  } catch (e) {
    // ESLint output might not be JSON if there are no issues
  }
}

// 3. Prisma Schema Validation
console.log('\n📋 STEP 3: Database Schema Validation');
const prismaResult = runCommand('npx prisma validate', 'Prisma Schema Check');
if (!prismaResult.success) {
  report.criticalIssues.push('Prisma schema validation failed');
  report.sections.push({
    name: 'Database Schema Issues',
    output: prismaResult.output
  });
}

// 4. Check for Missing Dependencies
console.log('\n📋 STEP 4: Dependency Check');
const depsResult = runCommand('npm outdated --json', 'Dependency Check');
if (depsResult.output) {
  try {
    const outdated = JSON.parse(depsResult.output);
    const outdatedCount = Object.keys(outdated).length;
    if (outdatedCount > 0) {
      report.suggestions.push(`${outdatedCount} packages have updates available`);
    }
  } catch (e) {
    // No outdated packages
  }
}

// 5. Security Audit
console.log('\n📋 STEP 5: Security Audit');
const auditResult = runCommand('npm audit --json', 'Security Audit');
if (auditResult.output) {
  try {
    const auditData = JSON.parse(auditResult.output);
    const vulnerabilities = auditData.metadata?.vulnerabilities;
    if (vulnerabilities) {
      const total = vulnerabilities.total || 0;
      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;
      
      if (critical > 0 || high > 0) {
        report.criticalIssues.push(`Found ${critical} critical and ${high} high severity vulnerabilities`);
      }
      
      report.sections.push({
        name: 'Security Vulnerabilities',
        critical: critical,
        high: high,
        moderate: vulnerabilities.moderate || 0,
        low: vulnerabilities.low || 0
      });
    }
  } catch (e) {
    // Audit might fail or have no issues
  }
}

// Generate Summary
report.summary = {
  totalCriticalIssues: report.criticalIssues.length,
  totalWarnings: report.warnings.length,
  totalSuggestions: report.suggestions.length,
  overallHealth: report.criticalIssues.length === 0 ? 'GOOD' : 
                 report.criticalIssues.length < 5 ? 'FAIR' : 'NEEDS ATTENTION'
};

// Save detailed JSON report
const jsonReportPath = path.join(__dirname, '../../logs/code-review-report.json');
fs.mkdirSync(path.dirname(jsonReportPath), { recursive: true });
fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

console.log('\n✅ Detailed report saved to: logs/code-review-report.json');

// Generate Sonnet-Friendly Markdown Report
const mdReport = generateSonnetReport(report);
const mdReportPath = path.join(__dirname, '../../logs/SONNET_CODE_REVIEW.md');
fs.writeFileSync(mdReportPath, mdReport);

console.log('✅ Sonnet-friendly report saved to: logs/SONNET_CODE_REVIEW.md');

// Print summary to console
console.log('\n========================================');
console.log('  📊 CODE REVIEW SUMMARY');
console.log('========================================');
console.log(`Overall Health: ${report.summary.overallHealth}`);
console.log(`Critical Issues: ${report.summary.totalCriticalIssues}`);
console.log(`Warnings: ${report.summary.totalWarnings}`);
console.log(`Suggestions: ${report.summary.totalSuggestions}`);
console.log('========================================\n');

if (report.criticalIssues.length > 0) {
  console.log('⚠️  CRITICAL ISSUES FOUND:');
  report.criticalIssues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');
}

console.log('📄 Review the full report at: logs/SONNET_CODE_REVIEW.md');
console.log('💡 Copy this file and paste into Sonnet 4.5 for fix instructions\n');

function generateSonnetReport(report) {
  let md = `# 🔍 LegalOps v1 - Automated Code Review Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
  md += `**Overall Health:** ${report.summary.overallHealth}\n\n`;

  md += `## 📊 Summary\n\n`;
  md += `- **Critical Issues:** ${report.summary.totalCriticalIssues}\n`;
  md += `- **Warnings:** ${report.summary.totalWarnings}\n`;
  md += `- **Suggestions:** ${report.summary.totalSuggestions}\n\n`;

  if (report.criticalIssues.length > 0) {
    md += `## 🚨 Critical Issues (Requires Immediate Attention)\n\n`;
    report.criticalIssues.forEach((issue, i) => {
      md += `${i + 1}. ${issue}\n`;
    });
    md += `\n`;
  }

  if (report.warnings.length > 0) {
    md += `## ⚠️ Warnings\n\n`;
    report.warnings.forEach((warning, i) => {
      md += `${i + 1}. ${warning}\n`;
    });
    md += `\n`;
  }

  if (report.suggestions.length > 0) {
    md += `## 💡 Suggestions for Improvement\n\n`;
    report.suggestions.forEach((suggestion, i) => {
      md += `${i + 1}. ${suggestion}\n`;
    });
    md += `\n`;
  }

  md += `## 📋 Detailed Analysis\n\n`;

  report.sections.forEach(section => {
    md += `### ${section.name}\n\n`;

    if (section.count !== undefined) {
      md += `**Total Issues:** ${section.count}\n\n`;
      if (section.issues && section.issues.length > 0) {
        md += `\`\`\`\n`;
        section.issues.slice(0, 10).forEach(issue => {
          md += `${issue}\n`;
        });
        if (section.issues.length > 10) {
          md += `... and ${section.issues.length - 10} more\n`;
        }
        md += `\`\`\`\n\n`;
      }
    }

    if (section.errors !== undefined) {
      md += `- **Errors:** ${section.errors}\n`;
      md += `- **Warnings:** ${section.warnings}\n\n`;
    }

    if (section.critical !== undefined) {
      md += `- **Critical:** ${section.critical}\n`;
      md += `- **High:** ${section.high}\n`;
      md += `- **Moderate:** ${section.moderate}\n`;
      md += `- **Low:** ${section.low}\n\n`;
    }

    if (section.output) {
      md += `\`\`\`\n${section.output.slice(0, 500)}\n\`\`\`\n\n`;
    }
  });

  md += `---\n\n`;
  md += `## 🤖 Instructions for Sonnet 4.5\n\n`;
  md += `Please review the issues above and provide:\n\n`;
  md += `1. **Root Cause Analysis** - What's causing these issues?\n`;
  md += `2. **Priority Ranking** - Which issues should be fixed first?\n`;
  md += `3. **Step-by-Step Fix Instructions** - Detailed instructions for each critical issue\n`;
  md += `4. **Code Examples** - Show me the exact code changes needed\n`;
  md += `5. **Prevention Strategy** - How to avoid these issues in the future\n\n`;
  md += `Focus on critical issues first, then warnings, then suggestions.\n`;

  return md;
}

process.exit(report.criticalIssues.length > 0 ? 1 : 0);

