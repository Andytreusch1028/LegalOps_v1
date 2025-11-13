# LegalOps v1 - Documentation Organization Script
# Moves .md files from project root to appropriate docs/ subfolders

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = "logs/file_movement_log.txt"

# Function to log file movements
function Log-Movement {
    param($source, $destination, $status)
    $entry = "[$timestamp] $status: $source -> $destination"
    Add-Content -Path $logFile -Value $entry
    Write-Host $entry
}

# Create destination directories if they don't exist
$dirs = @(
    "legalops-platform/docs/01-getting-started",
    "legalops-platform/docs/02-design-system",
    "legalops-platform/docs/03-architecture",
    "legalops-platform/docs/04-features/forms",
    "legalops-platform/docs/04-features/ai",
    "legalops-platform/docs/05-testing",
    "legalops-platform/docs/06-integrations",
    "legalops-platform/docs/07-implementation-summaries",
    "legalops-platform/docs/08-session-notes"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Build Plans & Implementation Guides -> docs/07-implementation-summaries/
$buildPlans = @(
    "2024_comprehensive_implementation_plan.md",
    "2024_operational_implementation_plan.md",
    "2024_production_deployment_plan.md",
    "AI_INTEGRATION_BUILD_PLAN.md",
    "BUILD_PLAN.md",
    "COMPLETE_BUILD_FIRST_PLAN.md",
    "COMPLETE_BUILD_IMPLEMENTATION_GUIDE.md",
    "CUSTOMIZED_BUILD_PLAN.md",
    "HYBRID_AI_BUILD_PLAN.md",
    "HYBRID_IMPLEMENTATION_GUIDE.md",
    "IMPLEMENTATION_BLUEPRINT.md",
    "LEGALOPS_MASTER_BUILD_PLAN.md",
    "ADJUSTED_TIMELINE.md",
    "ESTATE_PLANNING_BUILD_TIMELINE.md"
)

foreach ($file in $buildPlans) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/07-implementation-summaries/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Feature Documentation -> docs/04-features/
$features = @(
    "2024_feature_demonstration.md",
    "AI_INTEGRATION_STRATEGY.md",
    "COMPREHENSIVE_AI_AGENTS_STRATEGY.md",
    "CORE_FEATURES_ROADMAP.md",
    "FOCUS_DASHBOARD.md",
    "PROJECT_MANAGEMENT_SYSTEM.md"
)

foreach ($file in $features) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/04-features/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Testing -> docs/05-testing/
$testing = @(
    "2024_testing_guide.md",
    "COMPREHENSIVE_CHECKLIST.md"
)

foreach ($file in $testing) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/05-testing/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Deployment & Operations -> docs/06-integrations/
$deployment = @(
    "2024_operational_runbook.md",
    "2024_production_deployment_guide.md",
    "2024_upl_compliance_guide.md",
    "API_DOCUMENTATION.md"
)

foreach ($file in $deployment) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/06-integrations/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Architecture -> docs/03-architecture/
$architecture = @(
    "COMPLETE_TECH_STACK.md",
    "APP_OVERVIEW.md",
    "PHASE1_BUDGET_BREAKDOWN.md",
    "SELF_DEVELOPMENT_BUDGET.md",
    "SELF_HOSTED_AI_ANALYSIS.md",
    "STARTUP_COST_COMPARISON.md",
    "COST_REDUCTION_STRATEGIES.md",
    "api.md",
    "asynchronous.md",
    "benchmarks.md",
    "browser.md",
    "bundling.md",
    "child-loggers.md",
    "diagnostics.md",
    "ecosystem.md",
    "help.md",
    "lts.md",
    "network-validation.md",
    "pretty.md",
    "redaction.md",
    "shutdown.md",
    "sidebar.md",
    "transports.md",
    "ts-node-basics.md",
    "web.md"
)

foreach ($file in $architecture) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/03-architecture/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Design System -> docs/02-design-system/
$design = @(
    "CodingPatternPreferences.md"
)

foreach ($file in $design) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/02-design-system/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Getting Started -> docs/01-getting-started/
$gettingStarted = @(
    "AUTHENTICATION_SETUP.md",
    "DATABASE_SCHEMA_SETUP.md",
    "DASHBOARD_SETUP.md",
    "MONTH_1_LEARNING_PLAN.md",
    "SESSION_STARTUP.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "AUTHORS.md",
    "LICENSE.md",
    "NODE-LICENSE.md",
    "CHANGELOG.md",
    "CHANGES.md",
    "TROUBLESHOOTING.md",
    "DEVELOPMENT_PROTOCOL.md",
    "ADR-template.md",
    "README-es.md",
    "README_pt_BR.md",
    "History.md",
    "Porting-Buffer.md"
)

foreach ($file in $gettingStarted) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/01-getting-started/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Tutorials -> docs/04-features/forms/
$tutorials = @(
    "FORM_VALIDATION_TUTORIAL.md",
    "AUDIT_LOGGING_TUTORIAL.md",
    "DATABASE_BACKUP_TUTORIAL.md",
    "ERROR_TRACKING_TUTORIAL.md",
    "FILE_STORAGE_TUTORIAL.md",
    "NOTIFICATION_SYSTEM_TUTORIAL.md",
    "STRIPE_INTEGRATION_TUTORIAL.md"
)

foreach ($file in $tutorials) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/04-features/forms/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# AI Documentation -> docs/04-features/ai/
$ai = @(
    "LEGALOPS_AI_INTEGRATION_COMPREHENSIVE_GUIDE.md"
)

foreach ($file in $ai) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/04-features/ai/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

# Session Notes -> docs/08-session-notes/
$sessions = @(
    "PROGRESS_REVIEW_AND_MAPPING.md",
    "PROGRESS_TRACKER.md",
    "UPDATE_PROGRESS.md",
    "WEEKLY_TEMPLATES.md",
    "auth-spike.md",
    "code-review.md",
    "discovery-schedule.md",
    "entity-compliance.md",
    "git-notes.md",
    "increment-1.md",
    "interview-guide.md",
    "journal.md",
    "open-questions.md",
    "progress.md",
    "release-notes.md",
    "risk-register.md",
    "startup.md",
    "storage-spike.md",
    "testing-notes.md"
)

foreach ($file in $sessions) {
    if (Test-Path $file) {
        $dest = "legalops-platform/docs/08-session-notes/$file"
        Move-Item -Path $file -Destination $dest -Force
        Log-Movement $file $dest "MOVED"
    }
}

Write-Host "`n‚úÖ Documentation organization complete!"
Write-Host "Ì≥ù Check logs/file_movement_log.txt for details"
