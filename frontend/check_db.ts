
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const latestDebitur = await prisma.debitur.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!latestDebitur) {
            console.log('No debitur found.');
            return;
        }

        console.log('Latest Debitur:', latestDebitur.namaPemohon);
        console.log('Jenis Pengajuan:', latestDebitur.jenisPengajuan);

        const dataLengkap = latestDebitur.dataLengkap as any;
        const facilities = dataLengkap.slik_facilities || [];

        console.log('SLIK Facilities Count:', facilities.length);
        facilities.forEach((f: any, i: number) => {
            console.log(`Facility ${i + 1}:`);
            console.log(`  Bank: ${f.nama_bank}`);
            console.log(`  NoRek: ${f.nomor_rekening_pinjaman}`);
            console.log(`  NoPK: ${f.nomor_pk}`);
            console.log(`  Alasan: ${f.alasan}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
