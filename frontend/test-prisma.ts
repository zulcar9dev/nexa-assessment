import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const q = "dinas";
    const debiturs = await prisma.debitur.findMany({
        where: {
            dataLengkap: {
                path: ['instansi'],
                string_contains: q
            }
        },
        take: 1
    });
    console.log("Success", debiturs.length);
}
run().catch(console.error).finally(() => prisma.$disconnect());
