import { DebiturService } from './src/backend/services/clients.service';

async function run() {
    console.log("Testing search for 'Pratype_b'");
    const res1 = await DebiturService.getList({ q: 'Pratype_b', limit: 1 });
    console.log("Found:", res1.data.length);
    
    console.log("Testing search for 'dinas'");
    const res2 = await DebiturService.getList({ q: 'dinas', limit: 1 });
    console.log("Found:", res2.data.length);
}
run().catch(console.error);
