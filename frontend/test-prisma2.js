const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const debiturs = await prisma.debitur.findMany({
        take: 10,
        select: { id: true, namaPemohon: true, dataLengkap: true }
    });
    console.log(JSON.stringify(debiturs, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
