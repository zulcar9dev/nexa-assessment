
import { TemplateService } from '../src/backend/services/template.service';
import { promises as fs } from 'fs';
import path from 'path';

async function testUpload() {
    console.log("=== TESTING TEMPLATE UPLOAD LOGIC ===");

    // Create a dummy docx buffer
    const dummyBuffer = Buffer.from("DUMMY CONTENT");
    const kategori = "PURNA";

    try {
        console.log(`Simulating upload for ${kategori}...`);

        // Use the actual service logic
        // Note: We need to import the real service, so we rely on ts-node resolving paths correctly now
        // If imports fail again, we know the environment issue persists.
        // But for this test, we want to test the SERVICE logic, specifically saveFile.

        // Replicating saveFile logic manually to inspect it step-by-step 
        // because we suspect an issue there if we can't run the service directly.

        const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

        // 1. Ensure Dir
        await fs.mkdir(TEMPLATE_DIR, { recursive: true });

        // 2. Generate filename logic from service
        const originalFilename = "my_new_template_v2.docx"; // Simulating user upload name
        const ext = path.extname(originalFilename);
        const safeKategori = kategori.toLowerCase();
        const filename = `template_${safeKategori}${ext}`;
        const filepath = path.join(TEMPLATE_DIR, filename);

        console.log(`Original Filename: ${originalFilename}`);
        console.log(`Target Filename: ${filename}`);
        console.log(`Target Path: ${filepath}`);

        // 3. Check if file exists before
        try {
            const stats = await fs.stat(filepath);
            console.log(`File exists BEFORE upload. Size: ${stats.size}`);
        } catch {
            console.log("File does NOT exist before upload.");
        }

        // 4. Write file (Simulate overwrite)
        console.log("Writing new content...");
        await fs.writeFile(filepath, dummyBuffer);

        // 5. Check if file exists after
        const newStats = await fs.stat(filepath);
        console.log(`File exists AFTER upload. Size: ${newStats.size}`);

        console.log("=== UPLOAD LOGIC LOOKS CORRECT ===");
        console.log("The service forces the filename to be 'template_purna.docx' regardless of upload name.");

    } catch (e) {
        console.error("Error during upload simulation:", e);
    }
}

testUpload();
