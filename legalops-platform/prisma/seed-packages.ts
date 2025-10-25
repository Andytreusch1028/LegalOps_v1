import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seedPackages() {
  console.log('🌱 Seeding packages...');

  // Basic Package - $0 Entry Point
  const basicPackage = await prisma.package.upsert({
    where: { slug: 'basic' },
    update: {},
    create: {
      name: 'Basic',
      slug: 'basic',
      price: 0,
      description: 'Essential formation filing only. Perfect for DIY entrepreneurs who want to handle everything themselves.',
      features: [
        'LLC or Corporation formation filing',
        'State filing fees included',
        'Digital delivery of formation documents',
        'Email support',
        'Basic compliance guide',
      ],
      isActive: true,
      displayOrder: 1,
      includesRA: false,
      raYears: 0,
      includesEIN: false,
      includesAI: false,
      includesOperatingAgreement: false,
      includesComplianceCalendar: false,
      badge: null,
      highlightColor: 'sky',
    },
  });

  // Standard Package - Most Popular
  const standardPackage = await prisma.package.upsert({
    where: { slug: 'standard' },
    update: {},
    create: {
      name: 'Standard',
      slug: 'standard',
      price: 149,
      description: 'Everything you need to get started. Most popular choice for new business owners.',
      features: [
        'Everything in Basic',
        'FREE first year Registered Agent service ($199 value)',
        'Operating Agreement (LLC) or Bylaws (Corporation)',
        'Compliance calendar (1 year)',
        'Priority email support',
        'Document storage in dashboard',
        'Annual report reminder',
      ],
      isActive: true,
      displayOrder: 2,
      includesRA: true,
      raYears: 1,
      includesEIN: false,
      includesAI: false,
      includesOperatingAgreement: true,
      includesComplianceCalendar: true,
      badge: 'Most Popular',
      highlightColor: 'emerald',
    },
  });

  // Premium Package - Best Value
  const premiumPackage = await prisma.package.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      name: 'Premium',
      slug: 'premium',
      price: 299,
      description: 'Complete business setup with AI-powered features. Best value for serious entrepreneurs.',
      features: [
        'Everything in Standard',
        'EIN application assistance',
        'AI-powered business health score',
        'AI document intelligence',
        'AI compliance tracking',
        'Priority live chat support',
        'Unlimited document storage',
        'Annual report reminder service (1 year)',
        'Banking resolution',
        'S-Corp election guidance',
      ],
      isActive: true,
      displayOrder: 3,
      includesRA: true,
      raYears: 1,
      includesEIN: true,
      includesAI: true,
      includesOperatingAgreement: true,
      includesComplianceCalendar: true,
      badge: 'Best Value',
      highlightColor: 'purple',
    },
  });

  console.log('✅ Packages seeded successfully!');
  console.log(`   - Basic Package: ${basicPackage.name} ($${basicPackage.price})`);
  console.log(`   - Standard Package: ${standardPackage.name} ($${standardPackage.price})`);
  console.log(`   - Premium Package: ${premiumPackage.name} ($${premiumPackage.price})`);
}

async function main() {
  try {
    await seedPackages();
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

