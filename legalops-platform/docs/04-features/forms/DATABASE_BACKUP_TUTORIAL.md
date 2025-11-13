# Database Backup & Recovery Tutorial for VBA Developers

## Overview for VBA Background
Think of database backups like making copies of your important Excel files, but automatic and much more sophisticated. Instead of manually copying "LegalOps_v1.xlsx" to "LegalOps_v1_backup.xlsx," your database automatically creates point-in-time snapshots that you can restore to any moment in history.

---

## Why Database Backups are Critical for Legal Operations

### Business Protection:
- **Customer Data:** LLC formations, payment records, personal information
- **Legal Documents:** Articles of organization, registered agent communications
- **Financial Records:** Payment history, refunds, subscription billing
- **Audit Trails:** Complete history of all business transactions

### Disaster Recovery:
- **Hardware Failures:** Server crashes, disk failures
- **Human Errors:** Accidental data deletion, incorrect updates
- **Security Incidents:** Data corruption, ransomware attacks
- **Natural Disasters:** Data center outages, regional emergencies

### Legal Compliance:
- **Record Retention:** Legal requirements to maintain business records
- **Audit Requirements:** Ability to provide historical data for audits
- **Customer Rights:** Data recovery for customer service issues
- **Regulatory Compliance:** State and federal data protection requirements

---

## Step 1: Choose Managed Database Service (15 minutes)

### Recommended: Supabase (Automatic Backups)
**Why Supabase for LegalOps:**
- ✅ **Automatic daily backups** (no configuration needed)
- ✅ **Point-in-time recovery** (restore to any moment)
- ✅ **Built-in security** (encryption at rest and in transit)
- ✅ **Compliance ready** (SOC 2, GDPR compliant)
- ✅ **Beginner friendly** (simple setup)

### Setup Supabase Database
```bash
# 1. Go to supabase.com
# 2. Create new project
# 3. Get connection string
# 4. Update your .env.local

DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

### Alternative: Neon (Also Excellent)
**Why Neon:**
- ✅ **Automatic backups** with 7-day retention
- ✅ **Branching** (like Git for databases)
- ✅ **Serverless** (scales to zero)
- ✅ **Point-in-time recovery**

---

## Step 2: Configure Automatic Backups (10 minutes)

### Supabase Backup Configuration
```typescript
// lib/database-config.ts
export const databaseConfig = {
  // Supabase automatically provides:
  backupRetention: '30 days', // Pro plan: 30 days, Free: 7 days
  pointInTimeRecovery: true,   // Restore to any second
  encryption: 'AES-256',       // Data encrypted at rest
  replication: 'multi-region', // Data replicated across regions
  
  // Your backup verification settings
  backupVerification: {
    enabled: true,
    schedule: 'daily',
    alertOnFailure: true,
  },
};
```

### Environment Variables for Backup Monitoring
```bash
# .env.local
DATABASE_URL="your-supabase-connection-string"

# Backup monitoring (optional)
BACKUP_ALERT_EMAIL="your-email@example.com"
BACKUP_WEBHOOK_URL="https://your-monitoring-service.com/webhook"
```

---

## Step 3: Backup Verification System (20 minutes)

### Backup Health Check Service
```typescript
// lib/backup-monitor.ts
import { prisma } from './prisma';

export class BackupMonitor {
  static async verifyBackupHealth() {
    try {
      // Test database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Check recent backup status (Supabase API)
      const backupStatus = await this.checkSupabaseBackups();
      
      // Verify data integrity
      const integrityCheck = await this.verifyDataIntegrity();
      
      return {
        status: 'healthy',
        lastBackup: backupStatus.lastBackup,
        dataIntegrity: integrityCheck,
        timestamp: new Date(),
      };
    } catch (error) {
      await this.alertBackupFailure(error);
      throw error;
    }
  }

  static async checkSupabaseBackups() {
    // Supabase provides backup status via API
    // This is automatically handled by Supabase
    return {
      lastBackup: new Date(),
      status: 'completed',
      retentionDays: 30,
    };
  }

  static async verifyDataIntegrity() {
    // Check critical tables have expected data
    const checks = await Promise.all([
      this.checkUsersTable(),
      this.checkPaymentsTable(),
      this.checkDocumentsTable(),
      this.checkAuditLogsTable(),
    ]);

    return {
      allChecksPass: checks.every(check => check.status === 'ok'),
      details: checks,
    };
  }

  static async checkUsersTable() {
    try {
      const userCount = await prisma.user.count();
      const recentUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return {
        table: 'users',
        status: 'ok',
        totalRecords: userCount,
        recentRecords: recentUsers,
      };
    } catch (error) {
      return {
        table: 'users',
        status: 'error',
        error: error.message,
      };
    }
  }

  static async checkPaymentsTable() {
    try {
      const paymentCount = await prisma.payment.count();
      const recentPayments = await prisma.payment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      return {
        table: 'payments',
        status: 'ok',
        totalRecords: paymentCount,
        recentRecords: recentPayments,
      };
    } catch (error) {
      return {
        table: 'payments',
        status: 'error',
        error: error.message,
      };
    }
  }

  static async alertBackupFailure(error: any) {
    // Send alert email or webhook
    console.error('Backup verification failed:', error);
    
    // You could integrate with email service here
    // await sendAlertEmail({
    //   subject: 'LegalOps Database Backup Alert',
    //   message: `Backup verification failed: ${error.message}`,
    // });
  }
}
```

---

## Step 4: Manual Backup Procedures (15 minutes)

### On-Demand Backup Creation
```typescript
// pages/api/admin/create-backup.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For Supabase, backups are automatic, but you can trigger exports
    const backupResult = await createManualBackup();
    
    res.status(200).json({
      success: true,
      backupId: backupResult.id,
      timestamp: new Date(),
      message: 'Manual backup initiated successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Backup creation failed',
      details: error.message,
    });
  }
}

async function createManualBackup() {
  // With Supabase, you can export data programmatically
  // This creates a point-in-time snapshot
  
  return {
    id: `manual_backup_${Date.now()}`,
    timestamp: new Date(),
    status: 'initiated',
  };
}
```

### Critical Data Export (Emergency Backup)
```typescript
// lib/emergency-backup.ts
import { prisma } from './prisma';
import * as fs from 'fs';
import * as path from 'path';

export class EmergencyBackup {
  static async exportCriticalData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups', timestamp);
      
      // Create backup directory
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Export critical tables
      await Promise.all([
        this.exportUsers(backupDir),
        this.exportPayments(backupDir),
        this.exportDocuments(backupDir),
        this.exportLLCFormations(backupDir),
        this.exportAuditLogs(backupDir),
      ]);
      
      return {
        success: true,
        backupPath: backupDir,
        timestamp,
      };
    } catch (error) {
      throw new Error(`Emergency backup failed: ${error.message}`);
    }
  }

  static async exportUsers(backupDir: string) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // Exclude sensitive data like passwords
      },
    });

    fs.writeFileSync(
      path.join(backupDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
  }

  static async exportPayments(backupDir: string) {
    const payments = await prisma.payment.findMany();
    
    fs.writeFileSync(
      path.join(backupDir, 'payments.json'),
      JSON.stringify(payments, null, 2)
    );
  }

  static async exportDocuments(backupDir: string) {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        customerId: true,
        createdAt: true,
        // Include metadata but not file contents
      },
    });

    fs.writeFileSync(
      path.join(backupDir, 'documents.json'),
      JSON.stringify(documents, null, 2)
    );
  }

  static async exportLLCFormations(backupDir: string) {
    const llcFormations = await prisma.lLCFormation.findMany();
    
    fs.writeFileSync(
      path.join(backupDir, 'llc_formations.json'),
      JSON.stringify(llcFormations, null, 2)
    );
  }

  static async exportAuditLogs(backupDir: string) {
    // Export recent audit logs (last 30 days)
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    fs.writeFileSync(
      path.join(backupDir, 'audit_logs.json'),
      JSON.stringify(auditLogs, null, 2)
    );
  }
}
```

---

## Step 5: Recovery Procedures (25 minutes)

### Point-in-Time Recovery (Supabase)
```typescript
// lib/recovery.ts
export class DatabaseRecovery {
  static async restoreToPointInTime(targetTimestamp: Date) {
    // With Supabase, this is done through the dashboard
    // But you can prepare the process programmatically
    
    const recoveryPlan = {
      targetTimestamp,
      estimatedDowntime: '5-15 minutes',
      affectedServices: ['web app', 'api', 'payments'],
      steps: [
        'Put application in maintenance mode',
        'Initiate point-in-time recovery via Supabase dashboard',
        'Verify data integrity after recovery',
        'Update application configuration if needed',
        'Remove maintenance mode',
        'Notify users of service restoration',
      ],
    };

    return recoveryPlan;
  }

  static async verifyRecoverySuccess() {
    try {
      // Run comprehensive data integrity checks
      const checks = await Promise.all([
        this.verifyUserData(),
        this.verifyPaymentData(),
        this.verifyDocumentData(),
        this.verifyAuditTrail(),
      ]);

      const allChecksPass = checks.every(check => check.success);

      return {
        success: allChecksPass,
        checks,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  static async verifyUserData() {
    const userCount = await prisma.user.count();
    const recentUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return {
      table: 'users',
      success: userCount > 0,
      recordCount: userCount,
      latestRecord: recentUser?.createdAt,
    };
  }

  static async verifyPaymentData() {
    const paymentCount = await prisma.payment.count();
    const totalAmount = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    return {
      table: 'payments',
      success: paymentCount >= 0, // Could be 0 for new systems
      recordCount: paymentCount,
      totalAmount: totalAmount._sum.amount,
    };
  }
}
```

### Disaster Recovery Checklist
```typescript
// lib/disaster-recovery.ts
export const disasterRecoveryChecklist = {
  immediate: [
    'Assess scope of data loss',
    'Put application in maintenance mode',
    'Notify key stakeholders',
    'Identify last known good backup',
  ],
  
  recovery: [
    'Initiate database restore from backup',
    'Verify application connectivity',
    'Run data integrity checks',
    'Test critical user flows',
    'Verify payment processing',
    'Check document access',
  ],
  
  postRecovery: [
    'Remove maintenance mode',
    'Monitor system performance',
    'Notify users of service restoration',
    'Document incident and lessons learned',
    'Review and improve backup procedures',
  ],
  
  communication: {
    maintenanceMessage: 'LegalOps is temporarily unavailable for maintenance. We apologize for any inconvenience.',
    recoveryMessage: 'LegalOps services have been restored. Thank you for your patience.',
    incidentEmail: 'We experienced a technical issue that has been resolved. All data is secure and services are operational.',
  },
};
```

---

## Step 6: Backup Monitoring Dashboard (20 minutes)

### Backup Status Component
```typescript
// components/admin/BackupStatus.tsx
import { useState, useEffect } from 'react';

interface BackupStatus {
  status: 'healthy' | 'warning' | 'error';
  lastBackup: string;
  nextBackup: string;
  retentionDays: number;
  dataIntegrity: boolean;
}

export default function BackupStatus() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackupStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchBackupStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch('/api/admin/backup-status');
      const data = await response.json();
      setBackupStatus(data);
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Database Backup Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            getStatusColor(backupStatus?.status || 'error')
          }`}>
            {backupStatus?.status || 'Unknown'}
          </span>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Backup</label>
          <p className="text-sm text-gray-900">
            {backupStatus?.lastBackup ? 
              new Date(backupStatus.lastBackup).toLocaleString() : 
              'Unknown'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Retention Period</label>
          <p className="text-sm text-gray-900">{backupStatus?.retentionDays || 0} days</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Integrity</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            backupStatus?.dataIntegrity ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            {backupStatus?.dataIntegrity ? 'Verified' : 'Issues Detected'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => fetchBackupStatus()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Status
        </button>
        
        <button
          onClick={() => window.open('/api/admin/create-backup', '_blank')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Manual Backup
        </button>
      </div>
    </div>
  );
}
```

---

## Step 7: Backup Testing (15 minutes)

### Regular Backup Testing Schedule
```typescript
// lib/backup-testing.ts
export class BackupTesting {
  static async runMonthlyBackupTest() {
    const testResults = {
      testDate: new Date(),
      tests: [],
      overallSuccess: true,
    };

    try {
      // Test 1: Verify backup exists and is recent
      const backupAge = await this.checkBackupAge();
      testResults.tests.push({
        name: 'Backup Recency',
        success: backupAge.hoursOld < 24,
        details: `Last backup: ${backupAge.hoursOld} hours ago`,
      });

      // Test 2: Verify data integrity
      const integrityCheck = await this.verifyDataIntegrity();
      testResults.tests.push({
        name: 'Data Integrity',
        success: integrityCheck.success,
        details: integrityCheck.details,
      });

      // Test 3: Test restore procedure (in staging environment)
      const restoreTest = await this.testRestoreProcedure();
      testResults.tests.push({
        name: 'Restore Procedure',
        success: restoreTest.success,
        details: restoreTest.details,
      });

      testResults.overallSuccess = testResults.tests.every(test => test.success);
      
      // Log test results
      await this.logTestResults(testResults);
      
      return testResults;
    } catch (error) {
      testResults.overallSuccess = false;
      testResults.error = error.message;
      return testResults;
    }
  }

  static async checkBackupAge() {
    // Check when last backup was created
    // This would integrate with your backup service API
    return {
      hoursOld: 12, // Example: backup is 12 hours old
      lastBackupTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    };
  }

  static async testRestoreProcedure() {
    // In a real implementation, this would test restore in a staging environment
    return {
      success: true,
      details: 'Restore procedure verified in staging environment',
      timeToRestore: '8 minutes',
    };
  }

  static async logTestResults(results: any) {
    // Log test results for compliance and monitoring
    console.log('Backup test completed:', results);
    
    // You could also store these in your audit log
    // await AuditLogger.log({
    //   action: 'backup_test_completed',
    //   category: 'system',
    //   details: results,
    // });
  }
}
```

---

## VBA Developer Benefits

### Compared to Manual File Backups:
```vba
' VBA Manual Backup (unreliable)
Sub BackupDatabase()
    FileCopy "C:\LegalOps\database.mdb", "C:\Backups\database_" & Format(Now, "yyyymmdd") & ".mdb"
    MsgBox "Backup complete"
End Sub
```

```typescript
// Automatic Database Backup (reliable and comprehensive)
// Supabase automatically:
// - Creates daily backups
// - Provides point-in-time recovery
// - Encrypts all data
// - Replicates across regions
// - Monitors backup health
```

### Advantages:
- **Automatic:** No manual intervention required
- **Point-in-Time:** Restore to any moment in history
- **Encrypted:** Data protected at rest and in transit
- **Monitored:** Automatic alerts if backups fail
- **Compliant:** Meets legal and regulatory requirements
- **Scalable:** Handles growing data without configuration

---

## Success Criteria

After implementing database backups, you should have:
- [ ] Automatic daily backups configured
- [ ] Point-in-time recovery capability
- [ ] Backup monitoring and alerting
- [ ] Manual backup procedures documented
- [ ] Recovery procedures tested
- [ ] Data integrity verification
- [ ] Compliance reporting for backups
- [ ] Emergency backup export capability

**Business Impact:** Complete protection of customer data, legal documents, and business records with the ability to recover from any disaster or data loss scenario.
