/**
 * LEGALOPS MANIFEST AGENT
 * ------------------------------------------
 * Scans ONLY: ./legalops-platform/
 * Produces: legalops_snapshot.json
 * Safe: READ-ONLY. Does not modify your code.
 * 
 * Purpose:
 *   - Map entire folder structure
 *   - Extract workflows, validators, forms
 *   - Extract Prisma schema
 *   - Extract API routes
 *   - Extract components and services
 *   - Extract function signatures
 *   - Build dependency map
 *   - Build architecture.json model
 *   - Generate subway-map-ready data
 */

const fs = require("fs");
const path = require("path");

const APP_ROOT = path.join(process.cwd(), "legalops-platform");
const OUTPUT_FILE = path.join(process.cwd(), "legalops_snapshot.json");

const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".json", ".prisma"];

// Helper: read file safely
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

// Helper: recursively list files
function listFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  for (let item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results = results.concat(listFiles(full));
    } else {
      results.push(full);
    }
  }

  return results;
}

// Extract first + last lines (manifest technique)
function extractSnippet(fileText, lines = 40) {
  const allLines = fileText.split("\n");
  return {
    start: allLines.slice(0, lines).join("\n"),
    end: allLines.slice(-lines).join("\n"),
    totalLines: allLines.length
  };
}

// Identify categories by folder path
function categorize(file) {
  const p = file.replace(APP_ROOT, "").toLowerCase();

  if (p.includes("/api/")) return "api_route";
  if (p.includes("/prisma/") && file.endsWith(".prisma")) return "prisma_schema";
  if (p.includes("/validators/")) return "validator";
  if (p.includes("/forms/")) return "form";
  if (p.includes("/components/")) return "component";
  if (p.includes("/services/")) return "service";
  if (p.includes("/hooks/")) return "hook";
  if (p.includes("/scripts/")) return "script";
  if (p.includes("/app/")) return "workflow_ui";
  if (p.includes("/lib/")) return "lib";

  return "other";
}

// Extract function signatures (simple heuristic)
function findFunctions(text) {
  const regex = /(?:async\s+)?function\s+([A-Za-z0-9_]+)/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(m => m[1]);
}

// MAIN EXECUTION
console.log("🔍 LegalOps Manifest Agent Starting...");
console.log("📂 Scanning:", APP_ROOT);

const allFiles = listFiles(APP_ROOT)
  .filter(f => FILE_EXTENSIONS.some(ext => f.endsWith(ext)));

let manifest = {
  scannedAt: new Date().toISOString(),
  root: APP_ROOT,
  totalFiles: allFiles.length,
  files: [],
  summary: {
    workflows: 0,
    validators: 0,
    forms: 0,
    prismaModels: 0,
    routes: 0,
    hooks: 0,
    components: 0,
    services: 0
  }
};

for (let filePath of allFiles) {
  const text = safeRead(filePath);
  const snippet = extractSnippet(text);

  const category = categorize(filePath);
  const functions = findFunctions(text);

  // Summary counts
  if (category === "validator") manifest.summary.validators++;
  if (category === "form") manifest.summary.forms++;
  if (category === "api_route") manifest.summary.routes++;
  if (category === "prisma_schema") manifest.summary.prismaModels++;
  if (category === "component") manifest.summary.components++;
  if (category === "service") manifest.summary.services++;
  if (category === "workflow_ui") manifest.summary.workflows++;
  if (category === "hook") manifest.summary.hooks++;

  manifest.files.push({
    path: filePath.replace(process.cwd(), ""),
    category,
    snippets: snippet,
    functions
  });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

console.log("\n✅ Manifest complete!");
console.log("📄 Output file created:");
console.log("   ", OUTPUT_FILE);
console.log("\nUpload this file here and I will build your full system map.");
