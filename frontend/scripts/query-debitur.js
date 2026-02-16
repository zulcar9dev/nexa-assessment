const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Searching for Inda Rasid...');
    const debitur = await prisma.debitur.findMany({
        where: {
            namaPemohon: {
                contains: 'Inda Rasid',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            namaPemohon: true,
            kategori: true,
            dataLengkap: true
        }
    });

    console.log(`Found ${debitur.length} debiturs.`);
    
    // Print each debitur with relevant DSR/RPC fields
    debitur.forEach((d, idx) => {
        console.log(`\n=== Debitur ${idx + 1}: ${d.namaPemohon} ===`);
        console.log(`ID: ${d.id}`);
        console.log(`Kategori: ${d.kategori}`);
        
        const data = d.dataLengkap;
        console.log('\n--- Income Data ---');
        console.log(`Gaji Bulan 1: ${data.gaji_bulan_1_jumlah || '0'}`);
        console.log(`Gaji Bulan 2: ${data.gaji_bulan_2_jumlah || '0'}`);
        console.log(`Gaji Bulan 3: ${data.gaji_bulan_3_jumlah || '0'}`);
        console.log(`Additional Incomes: ${JSON.stringify(data.additional_incomes || [], null, 2)}`);
        
        console.log('\n--- SLIK Data ---');
        console.log(`SLIK Facilities: ${JSON.stringify(data.slik_facilities || [], null, 2)}`);
        console.log(`Fasilitas Nihil: ${data.fasilitas_nihil || 'NOT SET'}`);
        
        console.log('\n--- Proposed Loan ---');
        console.log(`Usulan Plafon: ${data.usulan_plafon_kredit || '0'}`);
        console.log(`Usulan Tenor: ${data.usulan_jangka_waktu_bulan || '0'}`);
        console.log(`Usulan Bunga: ${data.usulan_bunga_persen || '0'}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
