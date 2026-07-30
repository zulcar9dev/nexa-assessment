/**
 * Document Template Service (Refactored)
 * Facade for document generation modules.
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { TemplateService } from "./template.service";
import { TemplateContextBuilder } from "./document/template-context";
import { ClientData, KategoriDoc } from "./document/types";
import {
  restoreBankingTermsInXml,
  restoreBankingTermsInContext,
} from "./document/terminology";

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
    const rawContext = await TemplateContextBuilder.prepareTemplateContext(client);
    
    // Dynamically restore banking terms in context variables
    const context = restoreBankingTermsInContext(rawContext);

    // Pre-process XMLs inside the .docx zip archive:
    // 1. Replace hardcoded "Konfirmasi Gaji Pemohon" in Word templates with {{tujuan_call}} placeholder
    // 2. Dynamically restore banking terms in all Word XML files (document, headers, footers)
    const xmlFiles = zip.file(/^word\/.*\.xml$/);
    xmlFiles.forEach((file) => {
      let xmlContent = file.asText();

      if (file.name === "word/document.xml") {
        // Use a safer regex to avoid ReDoS when matching text split across XML tags
        const searchPattern = /Konfirmas[i]?\s*(?:<[^>]+>\s*)*Gaji\s*(?:<[^>]+>\s*)*Pemohon/gi;
        if (searchPattern.test(xmlContent)) {
          xmlContent = xmlContent.replace(
            searchPattern,
            "{{tujuan_call}}"
          );
        }
      }

      const restoredXml = restoreBankingTermsInXml(xmlContent);
      zip.file(file.name, restoredXml);
    });

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
