import prisma from '../src/backend/lib/prisma';
import { DebiturService } from '../src/backend/services/debitur.service';

// Manual Mocking of Prisma
const originalFindMany = prisma.debitur.findMany;
const originalCount = prisma.debitur.count;
const originalGroupBy = prisma.debitur.groupBy;

async function verifyCache() {
    console.log("Setting up mocks...");

    // Mock implementations
    // @ts-ignore
    prisma.debitur.count = async () => {
        console.log("  -> DB Call: count");
        await new Promise(r => setTimeout(r, 100)); // Simulate DB latency
        return 100;
    };
    // @ts-ignore
    prisma.debitur.groupBy = async () => {
        console.log("  -> DB Call: groupBy");
        return [];
    };
    // @ts-ignore
    prisma.debitur.findMany = async () => {
        console.log("  -> DB Call: findMany");
        await new Promise(r => setTimeout(r, 100)); // Simulate DB latency
        return [];
    };

    console.log("\nVerifying Stats Cache...");

    console.log("\n--- Call 1 (Should hit DB) ---");
    const start1 = performance.now();
    const stats1 = await DebiturService.getStats();
    const end1 = performance.now();
    console.log(`Call 1 Duration: ${(end1 - start1).toFixed(2)}ms`);

    console.log("\n--- Call 2 (Should be Cached) ---");
    const start2 = performance.now();
    const stats2 = await DebiturService.getStats();
    const end2 = performance.now();
    console.log(`Call 2 Duration: ${(end2 - start2).toFixed(2)}ms`);

    if (end2 - start2 < 20) { // Should be instant, definitely less than the 100ms lag we added
        console.log("\n✅ Success: Call 2 was significantly faster (cached)");
    } else {
        console.log("\n❌ Failure: Call 2 was slow (not cached)");
    }

    if (stats1 === stats2) {
        console.log("✅ Success: Objects are identical references");
    } else {
        console.log("❌ Failure: Objects are different references");
    }

    // Cleanup
    // @ts-ignore
    prisma.debitur.findMany = originalFindMany;
    // @ts-ignore
    prisma.debitur.count = originalCount;
    // @ts-ignore
    prisma.debitur.groupBy = originalGroupBy;
}

verifyCache().catch(console.error);

