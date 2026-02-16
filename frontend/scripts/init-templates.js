
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs').promises;

async function main() {
  console.log('Initializing templates...');
  
  const templateDir = path.join(process.cwd(), 'templates');
  
  const templates = [
    { kategori: 'AKTIF', filename: 'template_aktif.docx' },
    { kategori: 'PRAPURNA', filename: 'template_prapurna.docx' },
    { kategori: 'PURNA', filename: 'template_purna.docx' },
  ];

  for (const t of templates) {
    const filePath = path.join(templateDir, t.filename);
    try {
      await fs.access(filePath);
      console.log(`Found file: ${t.filename}`);
      
      await prisma.template.upsert({
        where: { kategori: t.kategori },
        create: {
          kategori: t.kategori,
          name: `Template ${t.kategori.charAt(0) + t.kategori.slice(1).toLowerCase()}`,
          filename: t.filename,
          path: filePath,
        },
        update: {
          filename: t.filename,
          path: filePath,
        },
      });
      console.log(`Upserted database record for ${t.kategori}`);
    } catch (e) {
      console.error(`File not found or error processing ${t.filename}:`, e);
    }
  }
  
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
