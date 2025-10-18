/**
 * LegalOps v1 - Seed Test Data
 * 
 * Creates sample data to test the Annual Report smart form:
 * - Test user
 * - Test client
 * - Test business entity (LLC)
 * - Addresses
 * - Registered agent
 * - Managers
 */

import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...\n');

  // 1. Create test user
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      id: 'test-user-001',
      email: 'john.doe@example.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '(305) 555-1234',
      userType: 'CUSTOMER',
      role: 'INDIVIDUAL_CUSTOMER', // Individual managing own businesses
    },
  });
  console.log('✅ User created:', user.email);

  // 2. Create test client
  console.log('\nCreating test client...');
  const client = await prisma.client.upsert({
    where: { id: 'test-client-001' },
    update: {},
    create: {
      id: 'test-client-001',
      userId: user.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(305) 555-1234',
    },
  });
  console.log('✅ Client created:', `${client.firstName} ${client.lastName}`);

  // 3. Create client's personal address
  console.log('\nCreating personal address...');
  const personalAddress = await prisma.address.create({
    data: {
      street: '123 Main Street',
      street2: 'Apt 4B',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      addressType: 'PERSONAL',
      clientId: client.id,
    },
  });
  console.log('✅ Personal address created:', personalAddress.street);

  // 4. Create business entity (LLC)
  console.log('\nCreating business entity (LLC)...');
  const businessEntity = await prisma.businessEntity.create({
    data: {
      id: 'test-entity-001',
      clientId: client.id,
      legalName: 'Sunshine Consulting LLC',
      documentNumber: 'L23000123456',
      feiNumber: '12-3456789',
      entityType: 'LLC',
      status: 'ACTIVE',
      filingDate: new Date('2023-01-15'),
      stateOfFormation: 'FL',
    },
  });
  console.log('✅ Business entity created:', businessEntity.legalName);

  // 5. Create principal address
  console.log('\nCreating principal address...');
  const principalAddress = await prisma.address.create({
    data: {
      street: '456 Business Boulevard',
      street2: 'Suite 200',
      city: 'Miami',
      state: 'FL',
      zipCode: '33102',
      addressType: 'PRINCIPAL',
      businessEntityId: businessEntity.id,
    },
  });
  console.log('✅ Principal address created:', principalAddress.street);

  // 6. Create mailing address (same as principal)
  console.log('\nCreating mailing address...');
  const mailingAddress = await prisma.address.create({
    data: {
      street: '456 Business Boulevard',
      street2: 'Suite 200',
      city: 'Miami',
      state: 'FL',
      zipCode: '33102',
      addressType: 'MAILING',
      businessEntityId: businessEntity.id,
    },
  });
  console.log('✅ Mailing address created:', mailingAddress.street);

  // 7. Create registered agent
  console.log('\nCreating registered agent...');
  const registeredAgent = await prisma.registeredAgent.create({
    data: {
      id: 'test-agent-001',
      businessEntityId: businessEntity.id,
      agentType: 'INDIVIDUAL',
      firstName: 'John',
      lastName: 'Doe',
      serviceStartDate: new Date('2023-01-15'),
    },
  });
  console.log('✅ Registered agent created:', `${registeredAgent.firstName} ${registeredAgent.lastName}`);

  // 8. Create registered agent address
  console.log('\nCreating registered agent address...');
  const agentAddress = await prisma.address.create({
    data: {
      street: '123 Main Street',
      street2: 'Apt 4B',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      addressType: 'REGISTERED_AGENT',
      registeredAgentId: registeredAgent.id,
    },
  });
  console.log('✅ Agent address created:', agentAddress.street);

  // 9. Create manager
  console.log('\nCreating manager...');
  const manager = await prisma.managerOfficer.create({
    data: {
      businessEntityId: businessEntity.id,
      firstName: 'John',
      lastName: 'Doe',
      title: 'Managing Member',
      roleType: 'MANAGER',
      address: '123 Main Street, Apt 4B, Miami, FL 33101',
    },
  });
  console.log('✅ Manager created:', `${manager.firstName} ${manager.lastName}`);

  // 10. Create initial LLC formation filing
  console.log('\nCreating LLC formation filing...');
  const filing = await prisma.filing.create({
    data: {
      businessEntityId: businessEntity.id,
      filingType: 'LLC_FORMATION',
      filingStatus: 'SUBMITTED',
      filingData: {
        correspondenceEmail: 'john.doe@example.com',
        effectiveDate: '2023-01-15',
        purpose: 'General business consulting services',
      },
      confirmationNumber: 'FL2023-LLC-123456',
      submittedAt: new Date('2023-01-15'),
    },
  });
  console.log('✅ Filing created:', filing.filingType);

  // 11. Create a second business entity for testing
  console.log('\nCreating second business entity...');
  const businessEntity2 = await prisma.businessEntity.create({
    data: {
      id: 'test-entity-002',
      clientId: client.id,
      legalName: 'Tech Innovations LLC',
      documentNumber: 'L22000987654',
      feiNumber: '98-7654321',
      entityType: 'LLC',
      status: 'ACTIVE',
      filingDate: new Date('2022-06-01'),
      stateOfFormation: 'FL',
    },
  });
  console.log('✅ Second business entity created:', businessEntity2.legalName);

  // Create addresses for second entity
  await prisma.address.createMany({
    data: [
      {
        street: '789 Tech Drive',
        city: 'Fort Lauderdale',
        state: 'FL',
        zipCode: '33301',
        addressType: 'PRINCIPAL',
        businessEntityId: businessEntity2.id,
      },
      {
        street: '789 Tech Drive',
        city: 'Fort Lauderdale',
        state: 'FL',
        zipCode: '33301',
        addressType: 'MAILING',
        businessEntityId: businessEntity2.id,
      },
    ],
  });

  // Create registered agent for second entity
  const agent2 = await prisma.registeredAgent.create({
    data: {
      id: 'test-agent-002',
      businessEntityId: businessEntity2.id,
      agentType: 'COMPANY',
      companyName: 'Florida Registered Agents Inc',
      serviceStartDate: new Date('2022-06-01'),
    },
  });

  await prisma.address.create({
    data: {
      street: '100 Agent Plaza',
      city: 'Fort Lauderdale',
      state: 'FL',
      zipCode: '33301',
      addressType: 'REGISTERED_AGENT',
      registeredAgentId: agent2.id,
    },
  });

  await prisma.managerOfficer.create({
    data: {
      businessEntityId: businessEntity2.id,
      firstName: 'John',
      lastName: 'Doe',
      title: 'Manager',
      roleType: 'MANAGER',
      address: '123 Main Street, Apt 4B, Miami, FL 33101',
    },
  });

  console.log('✅ Second entity setup complete');

  console.log('\n✨ Test data seeding complete!\n');
  console.log('📊 Summary:');
  console.log('  - 1 User: john.doe@example.com (password: password123)');
  console.log('  - 1 Client: John Doe');
  console.log('  - 2 Business Entities:');
  console.log('    • Sunshine Consulting LLC (L23000123456)');
  console.log('    • Tech Innovations LLC (L22000987654)');
  console.log('  - 7 Addresses');
  console.log('  - 2 Registered Agents');
  console.log('  - 2 Managers');
  console.log('  - 1 Filing\n');
  console.log('🚀 You can now test the Annual Report form!');
  console.log('   Navigate to: http://localhost:3000/dashboard/filings/annual-report\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

