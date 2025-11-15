const fs = require('fs');
const path = require('path');

// Read the ESLint report
const reportPath = path.join(__dirname, '../logs/eslint-any-types.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Count 'any' type errors per file
const anyTypeErrors = {};

report.forEach(file => {
  if (file.messages && file.messages.length > 0) {
    const anyErrors = file.messages.filter(msg => 
      msg.ruleId === '@typescript-eslint/no-explicit-any'
    );
    
    if (anyErrors.length > 0) {
      const relativePath = file.filePath.replace(/\\/g, '/').split('/legalops-platform/')[1];
      anyTypeErrors[relativePath] = {
        count: anyErrors.length,
        lines: anyErrors.map(e => e.line).sort((a, b) => a - b)
      };
    }
  }
});

// Sort by count (descending)
const sorted = Object.entries(anyTypeErrors)
  .sort((a, b) => b[1].count - a[1].count);

console.log('\n========================================');
console.log('  📊 ANY TYPE ERRORS BY FILE');
console.log('========================================\n');

let totalErrors = 0;
sorted.forEach(([file, data], index) => {
  totalErrors += data.count;
  console.log(`${index + 1}. ${file}`);
  console.log(`   Errors: ${data.count}`);
  console.log(`   Lines: ${data.lines.join(', ')}`);
  console.log('');
});

console.log('========================================');
console.log(`Total 'any' type errors: ${totalErrors}`);
console.log('========================================\n');

// Save prioritized list
const output = {
  totalErrors,
  filesByPriority: sorted.map(([file, data]) => ({
    file,
    errorCount: data.count,
    lines: data.lines
  }))
};

fs.writeFileSync(
  path.join(__dirname, '../logs/any-types-prioritized.json'),
  JSON.stringify(output, null, 2)
);

console.log('✅ Prioritized list saved to: logs/any-types-prioritized.json\n');

