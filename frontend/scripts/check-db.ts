
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplates() {
    console.log("Checking Template Database Records...");
    try {
        const templates = await prisma.template.findMany();
        console.log("Found templates:", templates);

        if (templates.length === 0) {
            console.log("No templates found in database.");
        }
    } catch (e) {
        console.error("Error querying database:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTemplates();
