/**
 * General Partnership Data Import Script
 * 
 * Downloads and imports Florida general partnership data from Sunbiz.org
 * Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/
 * 
 * FTP Access:
 * Host: https://sftp.floridados.gov
 * Username: Public
 * Password: PubAccess1845!
 * 
 * File Location: doc > quarterly > gen > genfile.zip
 */

import { PrismaClient } from '../src/generated/prisma';
import { normalizeBusinessName } from '../src/lib/sunbiz-checker';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

/**
 * Parse a fixed-width general partnership data record
 * Record Length: 759 characters
 */
interface GeneralPartnershipRecord {
  documentNumber: string;
  name: string;
  status: string;
  filingDate: string;
  effectiveDate: string;
  cancellationDate: string;
  expirationDate: string;
  principalAddress: string;
  mailingAddress: string;
  numberOfPartners: number;
}

function parseGeneralPartnershipRecord(line: string): GeneralPartnershipRecord | null {
  if (line.length < 759) {
    return null;
  }

  try {
    // Extract fields based on fixed positions from file definition
    const documentNumber = line.substring(0, 12).trim();
    const status = line.substring(12, 13).trim();
    const name = line.substring(13, 206).trim();
    const filingDate = line.substring(205, 214).trim();
    const effectiveDate = line.substring(213, 222).trim();
    const cancellationDate = line.substring(221, 230).trim();
    
    // Principal Address
    const princAddr1 = line.substring(240, 285).trim();
    const princAddr2 = line.substring(284, 329).trim();
    const princCity = line.substring(328, 357).trim();
    const princState = line.substring(356, 359).trim();
    const princZip = line.substring(358, 368).trim();
    
    // Mailing Address
    const mailAddr1 = line.substring(370, 415).trim();
    const mailAddr2 = line.substring(414, 459).trim();
    const mailCity = line.substring(458, 487).trim();
    const mailState = line.substring(486, 489).trim();
    const mailZip = line.substring(488, 498).trim();
    
    // Additional fields
    const expirationDate = line.substring(751, 760).trim();
    const totalPartners = parseInt(line.substring(746, 752).trim()) || 0;

    // Build addresses
    const principalAddress = [princAddr1, princAddr2, princCity, princState, princZip]
      .filter(Boolean)
      .join(', ');
    
    const mailingAddress = [mailAddr1, mailAddr2, mailCity, mailState, mailZip]
      .filter(Boolean)
      .join(', ');

    return {
      documentNumber,
      name,
      status,
      filingDate,
      effectiveDate,
      cancellationDate,
      expirationDate,
      principalAddress,
      mailingAddress,
      numberOfPartners: totalPartners,
    };
  } catch (error) {
    console.error('Error parsing record:', error);
    return null;
  }
}

/**
 * Parse file date from YYYYMMDD format
 */
function parseFileDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 8) {
    return null;
  }

  try {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dateStr.substring(6, 8));
    
    return new Date(year, month, day);
  } catch {
    return null;
  }
}

/**
 * Import general partnerships from a data file
 */
async function importFromFile(filePath: string): Promise<void> {
  console.log(`\n📂 Importing from: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  // Create sync record
  const sync = await prisma.entityDataSync.create({
    data: {
      syncType: 'full',
      dataType: 'partnership',
      status: 'in_progress',
    },
  });

  let recordsProcessed = 0;
  let recordsAdded = 0;
  let recordsUpdated = 0;
  let errors = 0;

  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    console.log('📊 Processing general partnership records...\n');

    for await (const line of rl) {
      recordsProcessed++;

      // Parse the record
      const record = parseGeneralPartnershipRecord(line);
      
      if (!record) {
        errors++;
        continue;
      }

      // Normalize the name for searching
      const normalizedName = normalizeBusinessName(record.name);

      // Parse dates
      const filingDate = parseFileDate(record.filingDate);
      const effectiveDate = parseFileDate(record.effectiveDate);
      const cancellationDate = parseFileDate(record.cancellationDate);
      const expirationDate = parseFileDate(record.expirationDate);

      try {
        // Upsert the general partnership
        await prisma.generalPartnership.upsert({
          where: { documentNumber: record.documentNumber },
          update: {
            name: record.name,
            normalizedName,
            status: record.status,
            filingDate,
            effectiveDate,
            cancellationDate,
            expirationDate,
            principalAddress: record.principalAddress || null,
            mailingAddress: record.mailingAddress || null,
            numberOfPartners: record.numberOfPartners,
            lastUpdated: new Date(),
          },
          create: {
            documentNumber: record.documentNumber,
            name: record.name,
            normalizedName,
            status: record.status,
            filingDate,
            effectiveDate,
            cancellationDate,
            expirationDate,
            principalAddress: record.principalAddress || null,
            mailingAddress: record.mailingAddress || null,
            numberOfPartners: record.numberOfPartners,
          },
        });

        recordsAdded++;
      } catch (error) {
        errors++;
        if (errors <= 10) {
          console.error(`Error importing record ${record.documentNumber}:`, error);
        }
      }

      // Progress update every 1000 records
      if (recordsProcessed % 1000 === 0) {
        console.log(`✓ Processed ${recordsProcessed.toLocaleString()} records (${recordsAdded.toLocaleString()} imported, ${errors} errors)`);
      }
    }

    // Update sync record
    await prisma.entityDataSync.update({
      where: { id: sync.id },
      data: {
        status: 'completed',
        recordsProcessed,
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
      },
    });

    console.log('\n✅ Import completed successfully!');
    console.log(`📊 Total records processed: ${recordsProcessed.toLocaleString()}`);
    console.log(`✓ Records imported: ${recordsAdded.toLocaleString()}`);
    console.log(`⚠ Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    
    await prisma.entityDataSync.update({
      where: { id: sync.id },
      data: {
        status: 'failed',
        recordsProcessed,
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 General Partnership Data Import Tool\n');
  console.log('This script imports Florida general partnership data from Sunbiz.org');
  console.log('Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/\n');

  // Get file path from command line argument
  const filePath = process.argv[2];

  if (!filePath) {
    console.log('Usage: npm run import-partnerships <path-to-genfile-file>');
    console.log('\nSteps to get the data:');
    console.log('1. Visit: https://sftp.floridados.gov');
    console.log('2. Login with:');
    console.log('   Username: Public');
    console.log('   Password: PubAccess1845!');
    console.log('3. Navigate to: doc > quarterly > gen');
    console.log('4. Download: genfile.zip');
    console.log('5. Extract the zip file');
    console.log('6. Run this script with the path to the extracted file\n');
    process.exit(1);
  }

  await importFromFile(filePath);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

