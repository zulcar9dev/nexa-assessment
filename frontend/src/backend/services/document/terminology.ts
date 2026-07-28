/**
 * Dynamic Terminology Restoration Utility
 * Restores banking/BNI terms in generated documents while keeping masked terms in the codebase/server files.
 */

export interface TerminologyRule {
  plainPattern: RegExp;
  xmlPattern: RegExp;
  replacement: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildXmlPattern(phrase: string, flags: string): RegExp {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length <= 1) {
    return new RegExp(escapeRegex(phrase), flags);
  }
  const escapedParts = parts.map(escapeRegex);
  // Matches any sequence of whitespace and/or XML tags between words
  const patternStr = escapedParts.join("(?:<[^>]*>|\\s+)+");
  return new RegExp(patternStr, flags);
}

function buildRule(phrase: string, replacement: string, flags = "g"): TerminologyRule {
  return {
    plainPattern: new RegExp(escapeRegex(phrase), flags),
    xmlPattern: buildXmlPattern(phrase, flags),
    replacement,
  };
}

// Order matters: longest/most specific matches FIRST!
export const TERMINOLOGY_RULES: TerminologyRule[] = [
  // 1. PT / Organization Names
  buildRule("PT. Assessment Nasional", "PT. Bank Negara Indonesia", "gi"),
  buildRule("PT Assessment Nasional", "PT Bank Negara Indonesia", "gi"),
  buildRule("Assessment Nasional", "Bank Negara Indonesia", "gi"),

  // 2. Specific Document Types & Categories
  buildRule("Type C Assessment", "BNI Fleksi Aktif", "gi"),
  buildRule("Type A Assessment", "BFP Pra Purna", "gi"),
  buildRule("Type B Assessment", "BFP Purna", "gi"),

  // 3. Product Names & All-Caps Variants
  buildRule("NEXA ASSESSMENT", "BNI FLEKSI", "g"),
  buildRule("Nexa Assessment", "BNI Fleksi", "g"),
  buildRule("nexa assessment", "bni fleksi", "g"),
  buildRule("Nexa Fleksi", "BNI Fleksi", "gi"),

  // 4. Facility Phrases
  buildRule("ASSESSMENT FACILITY", "FASILITAS KREDIT", "g"),
  buildRule("Assessment Facility", "Fasilitas Kredit", "gi"),
  buildRule("assessment facility", "fasilitas kredit", "g"),
  buildRule("Fasilitas Nexa", "Fasilitas BNI", "gi"),

  // 5. Bank Names
  buildRule("Bank Nexa", "Bank BNI", "gi"),
  buildRule("BANK NEXA", "BANK BNI", "g"),

  // 6. Standalone "Nexa"
  {
    plainPattern: /\bNEXA\b/g,
    xmlPattern: buildXmlPattern("NEXA", "g"),
    replacement: "BNI",
  },
  {
    plainPattern: /\bNexa\b/g,
    xmlPattern: buildXmlPattern("Nexa", "g"),
    replacement: "BNI",
  },
  {
    plainPattern: /\bnexa\b/g,
    xmlPattern: buildXmlPattern("nexa", "g"),
    replacement: "bni",
  },

  // 7. Standalone "Assessment"
  {
    plainPattern: /\bASSESSMENT\b/g,
    xmlPattern: buildXmlPattern("ASSESSMENT", "g"),
    replacement: "KREDIT",
  },
  {
    plainPattern: /\bAssessment\b/g,
    xmlPattern: buildXmlPattern("Assessment", "g"),
    replacement: "Kredit",
  },
  {
    plainPattern: /\bassessment\b/g,
    xmlPattern: buildXmlPattern("assessment", "g"),
    replacement: "kredit",
  },
];

/**
 * Replace terminology in plain text strings
 */
export function restoreBankingTerms(text: string): string {
  if (!text || typeof text !== "string") return text;
  let result = text;
  for (const rule of TERMINOLOGY_RULES) {
    result = result.replace(rule.plainPattern, rule.replacement);
  }
  return result;
}

/**
 * Replace terminology inside Word XML content (handles XML tags between words)
 */
export function restoreBankingTermsInXml(xml: string): string {
  if (!xml || typeof xml !== "string") return xml;
  let result = xml;
  for (const rule of TERMINOLOGY_RULES) {
    result = result.replace(rule.xmlPattern, rule.replacement);
  }
  return result;
}

/**
 * Recursively traverses data structure and replaces terminology in all string values
 */
export function restoreBankingTermsInContext<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === "string") {
    return restoreBankingTerms(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => restoreBankingTermsInContext(item)) as unknown as T;
  }
  if (typeof data === "object" && data.constructor === Object) {
    const res: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      res[key] = restoreBankingTermsInContext((data as Record<string, unknown>)[key]);
    }
    return res as unknown as T;
  }
  return data;
}
