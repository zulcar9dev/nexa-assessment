
import { DocumentTemplateService } from "../src/backend/services/document-template.service";

async function verifyCallMemo() {
    console.log("Testing generateCallMemoList...");

    // Mock Context
    const mockContext = {
        pensiunan: "PNS",
        instansi: "Kementerian Keuangan",
        status_rumah: "Milik Sendiri"
    };

    const list = DocumentTemplateService.generateCallMemoList(mockContext as any);
    console.log(JSON.stringify(list, null, 2));

    // Checks
    if (list.length !== 5) throw new Error(`Expected 5 items, got ${list.length}`);
    if (!list[0].text.includes("PNS")) throw new Error("Pensiunan placeholder failed");
    if (!list[1].text.includes("Milik Sendiri")) throw new Error("Status Rumah placeholder failed");

    console.log("Call Memo List Logic OK!");
}

verifyCallMemo().catch(console.error);
