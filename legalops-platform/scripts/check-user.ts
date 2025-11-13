import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'john.doe@example.com' }
  });

  console.log('User data:', JSON.stringify(user, null, 2));
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);

