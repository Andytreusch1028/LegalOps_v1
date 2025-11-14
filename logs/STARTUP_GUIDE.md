# 🚀 LegalOps v1 - Automated Startup System

## Quick Start

### Every Session, Just Run:
```bash
.\start-session.bat
```

That's it! Everything else is automated.

---

## What Happens Automatically

### ✅ STEP 1: Git Sync (30 seconds)
- Checks current Git status
- **Pulls latest code from GitHub** (so you always have the latest version)
- Shows recent commit history

### ✅ STEP 2: Automated Code Review (1-2 minutes)
Your "Senior Programmer" analyzes the entire codebase:

**Checks Performed:**
1. **TypeScript Type Errors** - Finds type mismatches, missing types, etc.
2. **ESLint Code Quality** - Finds code style issues, unused variables, potential bugs
3. **Database Schema** - Validates Prisma schema is correct
4. **Security Vulnerabilities** - Scans for known security issues in dependencies
5. **Dependency Updates** - Checks if packages need updating

**Output:**
- `logs/code-review-report.json` - Detailed technical report
- `logs/SONNET_CODE_REVIEW.md` - **Sonnet-friendly report** (this is what you need!)

### ✅ STEP 3: Opens VS Code (5 seconds)
- Automatically opens Visual Studio Code with your project
- Ready to start coding immediately

### ✅ STEP 4: Starts Development Server (10 seconds)
- Starts Qoder (Next.js with Turbopack)
- Server available at: **http://localhost:3000**
- Hot reload enabled - changes appear instantly

---

## How to Use the Code Review Report

### 1. **Open the Report**
After startup completes, open:
```
logs/SONNET_CODE_REVIEW.md
```

### 2. **Review the Summary**
Look at the top section:
- **Overall Health:** GOOD / FAIR / NEEDS ATTENTION
- **Critical Issues:** Number of urgent problems
- **Warnings:** Number of non-critical issues
- **Suggestions:** Improvement recommendations

### 3. **Copy & Paste to Sonnet 4.5**
- Open your Sonnet 4.5 chat
- Copy the **entire contents** of `SONNET_CODE_REVIEW.md`
- Paste into Sonnet
- Say: "Please analyze this code review and provide step-by-step fix instructions"

### 4. **Sonnet Will Provide:**
- Root cause analysis of each issue
- Priority ranking (what to fix first)
- Step-by-step fix instructions
- Exact code changes needed
- Prevention strategies

### 5. **Apply the Fixes**
- Copy Sonnet's fix instructions
- Apply them to your code
- Test the changes
- Commit when working

---

## Example Workflow

```
1. Double-click start-session.bat
   ↓
2. Wait 2-3 minutes for automated checks
   ↓
3. Open logs/SONNET_CODE_REVIEW.md
   ↓
4. Copy entire file
   ↓
5. Paste into Sonnet 4.5 chat
   ↓
6. Ask: "Please analyze and provide fix instructions"
   ↓
7. Follow Sonnet's step-by-step fixes
   ↓
8. Start coding your features!
```

---

## Understanding the Report Sections

### 🚨 Critical Issues
**Must fix immediately** - These prevent the app from working correctly:
- TypeScript errors that break compilation
- Critical security vulnerabilities
- Database schema problems

### ⚠️ Warnings
**Should fix soon** - These don't break the app but cause problems:
- ESLint warnings
- Moderate security issues
- Code quality issues

### 💡 Suggestions
**Nice to have** - Improvements for better code:
- Outdated dependencies
- Code style improvements
- Performance optimizations

---

## Troubleshooting

### "Code review script failed"
- Make sure you're in the project root directory
- Run: `cd legalops-platform && npm install`
- Try again

### "Git pull failed"
- You might have uncommitted changes
- Run: `git status` to see what changed
- Either commit your changes or run: `git stash`
- Then run start-session.bat again

### "VS Code didn't open"
- Make sure VS Code is installed
- Try opening manually: `code .`

### "Dev server won't start"
- Check if port 3000 is already in use
- Kill any running Node processes
- Try again

---

## Tips for Success

### 🎯 Daily Routine
1. **Morning:** Run `start-session.bat` → Review code issues → Fix critical problems
2. **During Day:** Code your features, test frequently
3. **Evening:** Run `save-session.bat` → Commit to GitHub

### 📚 Learning from Reviews
- Each code review teaches you common mistakes
- Over time, you'll write cleaner code naturally
- The "senior programmer" helps you learn best practices

### 🔄 Iterative Improvement
- Don't try to fix everything at once
- Focus on critical issues first
- Fix warnings gradually
- Suggestions can wait

### 💾 Always Commit Working Code
- Only commit when tests pass
- Use meaningful commit messages
- Push to GitHub at end of each session

---

## Need Help?

If you see issues you don't understand:
1. Copy the specific error from the report
2. Paste into Sonnet 4.5
3. Ask: "What does this error mean and how do I fix it?"

Sonnet will explain in beginner-friendly terms! 🚀

