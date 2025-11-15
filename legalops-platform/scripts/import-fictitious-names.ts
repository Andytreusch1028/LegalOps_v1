/**
 * Fictitious Name (DBA) Data Import Script
 * 
 * Downloads and imports Florida fictitious name (DBA) data from Sunbiz.org
 * Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/
 * 
 * FTP Access:
 * Host: https://sftp.floridados.gov
 * Username: Public
 * Password: PubAccess1845!
 * 
 * File Location: doc > quarterly > fic > ficdata.zip
 */

import { PrismaClient } from '../src/generated/prisma';
import { normalizeBusinessName } from '../src/lib/sunbiz-checker';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

/**
 * Parse a fixed-width fictitious name data record
 * Record Length: 2098 characters
 */
interface FictitiousNameRecord {
  documentNumber: string;
  fictitiousName: string;
  county: string;
  address: string;
  mailingAddress: string;
  filingDate: string;
  status: string;
  cancellationDate: string;
  expirationDate: string;
  numberOfOwners: number;
}

function parseFictitiousNameRecord(line: string): FictitiousNameRecord | null {
  if (line.length < 2098) {
    return null;
  }

  try {
    // Extract fields based on fixed positions from file definition
    const documentNumber = line.substring(0, 12).trim();
    const fictitiousName = line.substring(12, 205).trim();
    const county = line.substring(204, 217).trim();
    
    // Principal Address
    const addr1 = line.substring(216, 257).trim();
    const addr2 = line.substring(256, 297).trim();
    const city = line.substring(296, 325).trim();
    const state = line.substring(324, 327).trim();
    const zip = line.substring(326, 337).trim();
    
    // Mailing Address
    const mailAddr1 = line.substring(336, 377).trim();
    const mailAddr2 = line.substring(376, 417).trim();
    const mailCity = line.substring(416, 445).trim();
    const mailState = line.substring(444, 447).trim();
    const mailZip = line.substring(446, 457).trim();
    
    // Dates and Status
    const filingDate = line.substring(338, 347).trim();
    const statusCode = line.substring(351, 352).trim();
    const cancellationDate = line.substring(352, 361).trim();
    const expirationDate = line.substring(360, 369).trim();
    const numberOfOwners = parseInt(line.substring(368, 374).trim()) || 0;

    // Build addresses
    const address = [addr1, addr2, city, state, zip]
      .filter(Boolean)
      .join(', ');
    
    const mailingAddress = [mailAddr1, mailAddr2, mailCity, mailState, mailZip]
      .filter(Boolean)
      .join(', ');

    // Map status code: (C) Cancelled, (E) Expired, (A) Active
    const status = statusCode === 'A' ? 'ACTIVE' : statusCode === 'E' ? 'EXPIRED' : 'CANCELLED';

    return {
      documentNumber,
      fictitiousName,
      county,
      address,
      mailingAddress,
      filingDate,
      status,
      cancellationDate,
      expirationDate,
      numberOfOwners,
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
 * Import fictitious names from a data file
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
      dataType: 'fictitious',
      status: 'in_progress',
    },
  });

  let recordsProcessed = 0;
  let recordsAdded = 0;
  const recordsUpdated = 0;
  let errors = 0;

  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    console.log('📊 Processing fictitious name records...\n');

    for await (const line of rl) {
      recordsProcessed++;

      // Parse the record
      const record = parseFictitiousNameRecord(line);
      
      if (!record) {
        errors++;
        continue;
      }

      // Normalize the name for searching
      const normalizedName = normalizeBusinessName(record.fictitiousName);

      // Parse dates
      const filingDate = parseFileDate(record.filingDate);
      const expirationDate = parseFileDate(record.expirationDate);
      const cancellationDate = parseFileDate(record.cancellationDate);

      try {
        // Upsert the fictitious name
        await prisma.fictitiousName.upsert({
          where: { documentNumber: record.documentNumber },
          update: {
            fictitiousName: record.fictitiousName,
            normalizedName,
            county: record.county || null,
            status: record.status,
            filingDate,
            expirationDate,
            cancellationDate,
            principalAddress: record.address || null,
            mailingAddress: record.mailingAddress || null,
            numberOfOwners: record.numberOfOwners,
            lastUpdated: new Date(),
          },
          create: {
            documentNumber: record.documentNumber,
            fictitiousName: record.fictitiousName,
            normalizedName,
            county: record.county || null,
            status: record.status,
            filingDate,
            expirationDate,
            cancellationDate,
            principalAddress: record.address || null,
            mailingAddress: record.mailingAddress || null,
            numberOfOwners: record.numberOfOwners,
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
  console.log('🚀 Fictitious Name (DBA) Data Import Tool\n');
  console.log('This script imports Florida fictitious name data from Sunbiz.org');
  console.log('Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/\n');

  // Get file path from command line argument
  const filePath = process.argv[2];

  if (!filePath) {
    console.log('Usage: npm run import-dbas <path-to-ficdata-file>');
    console.log('\nSteps to get the data:');
    console.log('1. Visit: https://sftp.floridados.gov');
    console.log('2. Login with:');
    console.log('   Username: Public');
    console.log('   Password: PubAccess1845!');
    console.log('3. Navigate to: doc > quarterly > fic');
    console.log('4. Download: ficdata.zip');
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

