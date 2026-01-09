/**
 * Document Template Service (Refactored)
 * Facade for document generation modules.
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { TemplateService } from "./template.service";
import { TemplateContextBuilder } from "./document/template-context";
import { DebiturData, KategoriDoc } from "./document/types";
import { Kategori } from "@prisma/client"; // Assuming Prisma client has this, or we cast string

// Re-export types for backward compatibility
export type { KategoriDoc, DebiturData };

export class DocumentTemplateService {
  
  /**
   * Generate document from template using docxtemplater
   * Uses TemplateService for cached file access
   */
  static async generateFromTemplate(
    kategori: KategoriDoc,
    debitur: DebiturData
  ): Promise<Buffer> {
    
    // Map KategoriDoc (lowercase) to Kategori (uppercase Enum for TemplateService)
    // We cast to any/Kategori to match TemplateService signature
    const categoryEnum = kategori.toUpperCase() as any;

    // Read template file via TemplateService (Cached)
    const templateBuffer = await TemplateService.readFile(categoryEnum);
    
    if (!templateBuffer) {
        throw new Error(`Template not found for category: ${kategori}`);
    }

    // Load template with PizZip
    const zip = new PizZip(templateBuffer);

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

    // Prepare data context using the new Builder module
    const context = await TemplateContextBuilder.prepareTemplateContext(debitur);

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
