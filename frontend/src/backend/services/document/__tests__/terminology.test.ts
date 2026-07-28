import {
  restoreBankingTerms,
  restoreBankingTermsInXml,
  restoreBankingTermsInContext,
} from "../terminology";

describe("Terminology Restoration Utility", () => {
  describe("restoreBankingTerms", () => {
    it("should replace 'assessment' with 'kredit'", () => {
      expect(restoreBankingTerms("fasilitas assessment")).toBe("fasilitas kredit");
      expect(restoreBankingTerms("Proposal Assessment")).toBe("Proposal Kredit");
      expect(restoreBankingTerms("USULAN ASSESSMENT")).toBe("USULAN KREDIT");
    });

    it("should replace Type A/B/C Assessment accurately", () => {
      expect(restoreBankingTerms("Type A Assessment")).toBe("BFP Pra Purna");
      expect(restoreBankingTerms("Type B Assessment")).toBe("BFP Purna");
      expect(restoreBankingTerms("Type C Assessment")).toBe("BNI Fleksi Aktif");
    });

    it("should replace Nexa Assessment with BNI Fleksi", () => {
      expect(restoreBankingTerms("Nexa Assessment")).toBe("BNI Fleksi");
      expect(restoreBankingTerms("NEXA ASSESSMENT")).toBe("BNI FLEKSI");
      expect(restoreBankingTerms("nexa assessment")).toBe("bni fleksi");
    });

    it("should replace Assessment Facility with Fasilitas Kredit", () => {
      expect(restoreBankingTerms("Assessment Facility")).toBe("Fasilitas Kredit");
      expect(restoreBankingTerms("ASSESSMENT FACILITY")).toBe("FASILITAS KREDIT");
    });

    it("should replace PT. Assessment Nasional with PT. Bank Negara Indonesia", () => {
      expect(restoreBankingTerms("PT. Assessment Nasional (Persero) Tbk.")).toBe(
        "PT. Bank Negara Indonesia (Persero) Tbk."
      );
    });

    it("should replace Bank Nexa with Bank BNI", () => {
      expect(restoreBankingTerms("kewajiban di Bank Nexa")).toBe("kewajiban di Bank BNI");
    });

    it("should replace standalone Nexa with BNI", () => {
      expect(restoreBankingTerms("payroll melalu Nexa")).toBe("payroll melalu BNI");
    });
  });

  describe("restoreBankingTermsInXml", () => {
    it("should handle XML tags between phrase words", () => {
      const xml = '<w:t>Nexa </w:t><w:t>Assessment</w:t>';
      expect(restoreBankingTermsInXml(xml)).toBe('<w:t>BNI Fleksi</w:t>');
    });
  });

  describe("restoreBankingTermsInContext", () => {
    it("should recursively replace strings in objects and arrays", () => {
      const input = {
        title: "Nexa Assessment Report",
        nested: {
          instansi: "PT. Assessment Nasional",
          list: [
            { text: "Penyaluran Fasilitas Nexa Assessment" },
            { text: "Type A Assessment" },
          ],
        },
      };

      const result = restoreBankingTermsInContext(input);

      expect(result).toEqual({
        title: "BNI Fleksi Report",
        nested: {
          instansi: "PT. Bank Negara Indonesia",
          list: [
            { text: "Penyaluran Fasilitas BNI Fleksi" },
            { text: "BFP Pra Purna" },
          ],
        },
      });
    });
  });
});
