/**
 * Document Template Service (Refactored)
 * Facade for document generation modules.
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { TemplateService } from "./template.service";
import { TemplateContextBuilder } from "./document/template-context";
import { ClientData, KategoriDoc } from "./document/types";
type Kategori = 'PRAPURNA' | 'PURNA' | 'AKTIF';

// Re-export types for backward compatibility
export type { KategoriDoc, ClientData };

export class DocumentTemplateService {
  
  /**
   * Generate document from template using docxtemplater
   * Uses TemplateService for cached file access
   */
  static async generateFromTemplate(
    kategori: KategoriDoc,
    client: ClientData
  ): Promise<Buffer> {
    
    // Map KategoriDoc (lowercase) to Kategori (uppercase Enum for TemplateService)
    // We cast to any/Kategori to match TemplateService signature
    const categoryEnum = kategori.toUpperCase() as Kategori;

    // Read template file via TemplateService (Cached)
    const templateBuffer = await TemplateService.readFile(categoryEnum);
    
    if (!templateBuffer) {
        throw new Error(`Template not found for category: ${kategori}`);
    }

    // Load template with PizZip
    const zip = new PizZip(templateBuffer);

    // Prepare data context using the new Builder module
    const context = await TemplateContextBuilder.prepareTemplateContext(client);

    // Pre-process XML: Replace hardcoded "Konfirmasi Gaji Pemohon" in Word templates with {{tujuan_call}} placeholder
    // so that templates without {{tujuan_call}} placeholder dynamically adapt to Tunjangan / Uang Makan / Penghasilan.
    const docXmlFile = zip.file("word/document.xml");
    if (docXmlFile) {
      let docXml = docXmlFile.asText();
      if (
        docXml.includes("Konfirmasi Gaji Pemohon") ||
        docXml.includes("Konfirmas Gaji Pemohon") ||
        /Konfirmas[i]?(\s*<[^>]+>\s*|\s+)Gaji(\s*<[^>]+>\s*|\s+)Pemohon/i.test(docXml)
      ) {
        docXml = docXml.replace(
          /Konfirmas[i]?(\s*<[^>]+>\s*|\s+)Gaji(\s*<[^>]+>\s*|\s+)Pemohon/gi,
          "{{tujuan_call}}"
        );
        zip.file("word/document.xml", docXml);
      }
    }

    // Create docxtemplater instance with Jinja2-style delimiters
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "{{",
        end: "}}",
      },
      nullGetter: () => {
        return "";
      },
    });

    // Render template
    doc.render(context);

    // Generate output buffer
    const outputBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return outputBuffer as Buffer;
  }

  // --- Re-export or Proxy static methods if needed for backward compatibility ---
  // Based on analysis, only generateFromTemplate is explicitly used in route.ts.
  // We can add others back if we discover broken calls.
}
