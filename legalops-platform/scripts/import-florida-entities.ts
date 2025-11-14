/**
 * Florida Entity Data Import Script
 * 
 * Downloads and imports Florida business entity data from Sunbiz.org
 * Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/
 * 
 * FTP Access:
 * Host: https://sftp.floridados.gov
 * Username: Public
 * Password: PubAccess1845!
 * 
 * File Location: doc > quarterly > cor > cordata.zip
 */

import { PrismaClient } from '../src/generated/prisma';
import { normalizeBusinessName } from '../src/lib/sunbiz-checker';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

/**
 * Parse a fixed-width corporate data record
 * Record Length: 1440 characters
 */
interface CorporateRecord {
  documentNumber: string;
  name: string;
  status: string;
  filingType: string;
  principalAddress: string;
  mailingAddress: string;
  fileDate: string;
  registeredAgent: string;
}

function parseCorporateRecord(line: string): CorporateRecord | null {
  if (line.length < 1440) {
    return null;
  }

  try {
    // Extract fields based on fixed positions from file definition
    const documentNumber = line.substring(0, 12).trim();
    const name = line.substring(12, 205).trim();
    const statusCode = line.substring(204, 205).trim();
    const filingType = line.substring(205, 220).trim();
    
    // Principal Address
    const addr1 = line.substring(220, 262).trim();
    const addr2 = line.substring(262, 304).trim();
    const city = line.substring(304, 332).trim();
    const state = line.substring(332, 334).trim();
    const zip = line.substring(334, 344).trim();
    
    // Mailing Address
    const mailAddr1 = line.substring(346, 388).trim();
    const mailAddr2 = line.substring(388, 430).trim();
    const mailCity = line.substring(430, 458).trim();
    const mailState = line.substring(458, 460).trim();
    const mailZip = line.substring(460, 470).trim();
    
    // File Date (YYYYMMDD format)
    const fileDate = line.substring(472, 480).trim();
    
    // Registered Agent
    const registeredAgent = line.substring(544, 586).trim();

    // Build addresses
    const principalAddress = [addr1, addr2, city, state, zip]
      .filter(Boolean)
      .join(', ');
    
    const mailingAddress = [mailAddr1, mailAddr2, mailCity, mailState, mailZip]
      .filter(Boolean)
      .join(', ');

    // Map status code
    const status = statusCode === 'A' ? 'ACTIVE' : 'INACTIVE';

    return {
      documentNumber,
      name,
      status,
      filingType,
      principalAddress,
      mailingAddress,
      fileDate,
      registeredAgent,
    };
  } catch (error) {
    console.error('Error parsing record:', error);
    return null;
  }
}

/**
 * Map filing type to entity type
 */
function mapFilingTypeToEntityType(filingType: string): string {
  const typeMap: Record<string, string> = {
    'DOMP': 'Corporation',
    'DOMNP': 'Nonprofit Corporation',
    'FORP': 'Foreign Corporation',
    'FORNP': 'Foreign Nonprofit',
    'DOMLP': 'Limited Partnership',
    'FORLP': 'Foreign LP',
    'FLAL': 'LLC',
    'FORL': 'Foreign LLC',
    'NPREG': 'Nonprofit Registration',
    'TRUST': 'Business Trust',
    'AGENT': 'Registered Agent',
  };

  return typeMap[filingType] || filingType;
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
 * Import entities from a corporate data file
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
      dataType: 'corporate',
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

    console.log('📊 Processing records...\n');

    for await (const line of rl) {
      recordsProcessed++;

      // Parse the record
      const record = parseCorporateRecord(line);
      
      if (!record) {
        errors++;
        continue;
      }

      // Normalize the name for searching
      const normalizedName = normalizeBusinessName(record.name);

      // Parse filing date
      const filingDate = parseFileDate(record.fileDate);

      // Map entity type
      const entityType = mapFilingTypeToEntityType(record.filingType);

      try {
        // Upsert the entity
        await prisma.floridaEntity.upsert({
          where: { documentNumber: record.documentNumber },
          update: {
            name: record.name,
            normalizedName,
            status: record.status,
            entityType,
            filingDate,
            principalAddress: record.principalAddress || null,
            mailingAddress: record.mailingAddress || null,
            registeredAgent: record.registeredAgent || null,
            lastUpdated: new Date(),
          },
          create: {
            documentNumber: record.documentNumber,
            name: record.name,
            normalizedName,
            status: record.status,
            entityType,
            filingDate,
            principalAddress: record.principalAddress || null,
            mailingAddress: record.mailingAddress || null,
            registeredAgent: record.registeredAgent || null,
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
  console.log('🚀 Florida Entity Data Import Tool\n');
  console.log('This script imports Florida business entity data from Sunbiz.org');
  console.log('Data source: https://dos.fl.gov/sunbiz/other-services/data-downloads/\n');

  // Get file path or directory from command line argument
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.log('Usage: npm run import-entities <path-to-cordata-file-or-directory>');
    console.log('\nSteps to get the data:');
    console.log('1. Visit: https://sftp.floridados.gov');
    console.log('2. Login with:');
    console.log('   Username: Public');
    console.log('   Password: PubAccess1845!');
    console.log('3. Navigate to: doc > quarterly > cor');
    console.log('4. Download: cordata.zip');
    console.log('5. Extract the zip file');
    console.log('6. Run this script with the path to the extracted file(s)\n');
    console.log('Examples:');
    console.log('  npm run import-entities C:\\path\\to\\cordata.txt');
    console.log('  npm run import-entities C:\\path\\to\\sunbiz-data\n');
    process.exit(1);
  }

  // Check if input is a directory or a file
  const stats = fs.statSync(inputPath);

  if (stats.isDirectory()) {
    // Import all cordata*.txt files in the directory
    console.log(`📂 Scanning directory: ${inputPath}\n`);

    const files = fs.readdirSync(inputPath)
      .filter(file => file.match(/^cordata\d+\.txt$/i))
      .sort()
      .map(file => path.join(inputPath, file));

    if (files.length === 0) {
      console.error('❌ No cordata*.txt files found in directory');
      process.exit(1);
    }

    console.log(`Found ${files.length} file(s) to import:`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${path.basename(file)}`);
    });
    console.log('');

    // Import each file sequentially
    for (let i = 0; i < files.length; i++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 Processing file ${i + 1} of ${files.length}: ${path.basename(files[i])}`);
      console.log('='.repeat(60));
      await importFromFile(files[i]);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ ALL FILES IMPORTED SUCCESSFULLY!');
    console.log('='.repeat(60));

  } else {
    // Import single file
    await importFromFile(inputPath);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

