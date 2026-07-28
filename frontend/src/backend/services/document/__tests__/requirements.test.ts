import { TemplateContextBuilder } from "../template-context";
import { RequirementsContextBuilder } from "../requirements-context";
import { ClientData } from "../types";

describe("Requirements & Template Context Builder", () => {
  describe("RequirementsContextBuilder.build", () => {
    it("should populate list_syarat_pencairan in default auto-generated mode", () => {
      const client: ClientData = {
        applicantName: "Ahmad",
        idNumber: "1234567890",
        kategori: "PRAPURNA",
        jenisPengajuan: "baru",
        segmentasi: "Pemerintahan",
        dataLengkap: {
          nama_bank_pembayaran: "BNI",
        },
      };

      const result = RequirementsContextBuilder.build(client, []);
      expect(result.list_syarat_penandatanganan).toBeDefined();
      expect(Array.isArray(result.list_syarat_penandatanganan)).toBe(true);
      expect((result.list_syarat_penandatanganan as unknown[]).length).toBeGreaterThan(0);

      expect(result.list_syarat_pencairan).toBeDefined();
      expect(Array.isArray(result.list_syarat_pencairan)).toBe(true);
      expect((result.list_syarat_pencairan as unknown[]).length).toBeGreaterThan(0);
    });
  });

  describe("TemplateContextBuilder.prepareTemplateContext", () => {
    it("should correctly parse manual syarat text with literal \\n, /* comments, and dash prefixes", async () => {
      const client: ClientData = {
        applicantName: "Budi Santoso",
        idNumber: "3201123456",
        kategori: "PRAPURNA",
        jenisPengajuan: "baru",
        segmentasi: "Pemerintahan",
        dataLengkap: {
          syarat_penandatanganan_text:
            "Syarat Penandatanganan :\n-Membuka Rekening BNI Taplus atas nama {{nama_pemohon}}.\nPemohon wajib menyerahkan Surat Pernyataan.\n/*Menyerahkan Pas Foto berwarna Pemohon.\n-Biaya Propisi 0.2% dari Maksimum Kredit.",
          syarat_pencairan_text:
            "-Perjanjian Kredit telah ditandatangani by {{nama_pemohon}}\n/*Pencairan Kredit dengan Maksimum Kredit sebesar 105.000.000\n-Semua persyaratan kredit telah terpenuhi.",
        },
      };

      const context = await TemplateContextBuilder.prepareTemplateContext(client);

      const penandatangananList = context.list_syarat_penandatanganan as { text: string }[];
      expect(penandatangananList).toBeDefined();
      expect(penandatangananList.length).toBe(3);
      expect(penandatangananList[0].text).toContain("Membuka Rekening BNI Taplus atas nama Budi Santoso");
      expect(penandatangananList[1].text).toBe("Pemohon wajib menyerahkan Surat Pernyataan.");
      expect(penandatangananList[2].text).toBe("Biaya Propisi 0.2% dari Maksimum Kredit.");
      // Ensure comments were stripped
      expect(penandatangananList.some(item => item.text.includes("Pas Foto"))).toBe(false);

      const pencairanList = context.list_syarat_pencairan as { text: string }[];
      expect(pencairanList).toBeDefined();
      expect(pencairanList.length).toBe(2);
      expect(pencairanList[0].text).toBe("Perjanjian Kredit telah ditandatangani by Budi Santoso");
      expect(pencairanList[1].text).toBe("Semua persyaratan kredit telah terpenuhi.");
    });

    it("should handle literal \\\\n strings correctly", async () => {
      const client: ClientData = {
        applicantName: "Candra",
        idNumber: "3201123457",
        kategori: "PRAPURNA",
        jenisPengajuan: "baru",
        segmentasi: "Pemerintahan",
        dataLengkap: {
          syarat_penandatanganan_text:
            "-Item pertama\\n-Item kedua\\n/*Item komentar\\n-Item ketiga",
        },
      };

      const context = await TemplateContextBuilder.prepareTemplateContext(client);
      const list = context.list_syarat_penandatanganan as { text: string }[];

      expect(list.length).toBe(3);
      expect(list[0].text).toBe("Item pertama");
      expect(list[1].text).toBe("Item kedua");
      expect(list[2].text).toBe("Item ketiga");
    });
    it("should handle exact user prompt input string correctly", async () => {
      const userPenandatanganan = `Syarat Penandatanganan :
-Membuka Rekening BNI Taplus atas nama {{nama_pemohon}} dijadikan sebagai rekening afiliasi kredit sampai kredit lunas dan dijadikan rekening penyaluran manfaat pensiun pada saat pemohon telah pensiun.\\nPemohon wajib meyerahkan Surat Pernyataan yang isinya meminta kepada bank agar dana blokir rekening sebesar Angsuran perbulan dikali masa Pra Purna (masa sebelum Pensiun) dipotong dari dana pencairan kredit.\\nPembayaran kembali dilakukan dengan cara mendebet rekening afiliasi Pemohon setiap bulan sebesar angsuran hutang pokok dan bunga.\\nPada saat Pensiun Pemohon wajib menyerahkan Asli Surat Keputusan Pensiun (SK Pensiun) atas nama Pemohon.\\nSurat Kuasa Bermaterai Pengurusan Hak Pensiun Pemohon kepada BNI.\\nSurat Kuasa Bermaterai dari Pemohon Kepada Biro Kepegawaian/ Tata Usaha/ Seksi Personil/ Bagian Sumber Daya atau lainnya yang berwenang untuk menyerahkan Asli SK Pensiun kepada BNI.\\nSurat Kuasa Bermaterai dari Pemohon Kepada BNI Untuk Mengurus Pengambilan Asli SK Pensiun di Biro Kepegawaian/ Tata Usaha/ Seksi Personil/ Bagian Sumber Daya atau lainnya yang berwenang.\\nSurat Pernyataan Bermaterai yang ditandatangani Pemohon yang menyatakan bahwa :\\n-Pemohon memiliki Kondite yang baik ( tidak melanggar hukum/ Kode etik kerja )\\n-Pemohon akan menyalurkan manfaat pensiunnya ke rekening taplus (rekening Afiliasi)\\n-Pemohon tidak akan memindahkan Payroll Ke bank Lain sampai dengan kredit lunas\\n-Pemohon bersedia melakukan Pengurusan Penerbitan Asli Surat Keputusan (SK) Pensiun Pemohon bersama dengan Pegawai BNI ke Biro Kepegawaian / Tata Usaha / Seksi Personil/ Bagian Sumber Daya atau lainnya yang berwenang di Instansi Tempat Pemohon Bekerja\\nPada saat Status Kepegawaian Pemohon sudah menjadi Pensiun adalah sbb :\\n-Manfaat Pensiun Pemohon Disalurkan ke Rekening Taplus Afiliasi Pinjaman (tetap diblokir minimal sebesar 2 kali angsuran)\\nMenyerahkan Surat Pernyataan dan Kuasa Debitur BNI Fleksi Pensiun Prapurna Reguler (Lampiran II) Cfm. Surat Nomor DNS/6/3313 Tanggal 18 Oktober 2023 Perihal Updating Juklak BFP Pra Purna Calon Pensiun Peserta PT. Taspen\\nMenyerahkan Surat Pernyataan Kemampuan Membayar apabila Tunjangan Dihilangkan\\nMembuka rekening BNI Tapenas atas nama Pemohon selama jangka waktu 1 tahun.\\n/*Menyerahkan Pas Foto berwarna Pemohon.\\nMenyerahkan Asli SK Awal sampai dengan Akhir atas nama Pemohon sebagai jaminan kredit di BNI.\\nBiaya Propisi 0.2% dari Maksimum Kredit atau sebesar Rp. 210.000, Biaya Tata Laksana 3.5% dari Maksimum Kredit atau sebesar Rp. 3.675.000 dan Biaya Administrasi sebesar Rp. 80.000,-. Cfm. Surat No. CRP/4/0033 Tanggal 05 Januari 2026 Perihal Program Pricing BNI Fleksi (Aktif dan Pensiun) Awal Tahun 2026)\\nDownload dan Aktivasi Aplikasi “WONDR by BNI” dan melakukan trial transaksi berbayar minimal 3 (tiga) kali.\\nBiaya Pelunasan Sebelum Jatuh Tempo (PSJT) sebesar 10% dari Outstanding Kredit. (Cfm Surat DNS/6/1930 Tgl.27-9-2023).\\nLainnya Cfm. Ketentuan BNI Fleksi Pra Pensiun dan Ketentuan yang berlaku.`;

      const userPencairan = `Syarat Pencairan :
Pencairan Kredit akan dilakukan dengan cara sebagai berikut :
-Perjanjian Kredit telah ditandatangani oleh Pemohon\\nTelah dilakukan Penutupan Asuransi Jiwa Kredit atas nama Pemohon dibuktikan dengan Covernote dari Asuransi Jiwa Rekanan BNI\\nBiaya Propisi, Tata Laksana dan Biaya lainnya (apabila ada) agar di debet dari rekening afiliasi yang telah dibuka sebelumnya oleh Pemohon\\nRekening afiliasi kredit atas nama Pemohon diblokir sebesar 5 (Lima) kali angsuran, (1 (Satu) kali untuk angsuran masa Prapurna (dapat dibuka blokir setiap bulan untuk pembayaran angsuran), (2 (Dua) kali angsuran untuk perpindahan gaji ke Bank BNI (dapat dibuka setelah gaji pensiun telah tercermin di Rekening BNI) dan, 2 (Dua) kali angsuran ditambah saldo minimum Taplus dibuka saat kredit telah lunas.\\n/*Pencairan Kredit dengan Maksimum Kredit sebesar 105.000.000,- dapat dilakukan secara sekaligus ke rekening afiliasi atas nama Pemohon\\n/*Dilakukan pelunasan fasilitas kredit KTA di Bank Sulutgo atas nama Pemohon sebesar nominal pelunasan.\\n/*Sisa pencairan dilakukan setelah menyerahkan Bukti Lunas / Surat Keterangan Lunas dari Bank Sulutgo, Asli SK Awal dan SK Akhir serta proses Flagging Taspen di Bank BNI telah dijalankan dan semua persyaratan kredit telah terpenuhi.\\n/*Pencairan Kredit dengan Maksimum Kredit sebesar 105.000.000,- dapat dilakukan secara sekaligus ke rekening afiliasi atas nama Pemohon setelah proses Flagging Taspen di Bank BNI telah dijalankan dan semua persyaratan kredit telah terpenuhi.\\nPencairan Kredit dengan Maksimum Kredit sebesar 105.000.000,- dapat dilakukan secara sekaligus ke rekening afiliasi atas nama Pemohon dan semua persyaratan kredit telah terpenuhi.\\nLainnya Cfm. Ketentuan BNI Fleksi Pra Pensiun dan Ketentuan yang berlaku di BNI.`;

      const client: ClientData = {
        applicantName: "Hendra Supriadi",
        idNumber: "7171012345670001",
        kategori: "PRAPURNA",
        jenisPengajuan: "baru",
        segmentasi: "Pemerintahan",
        dataLengkap: {
          syarat_penandatanganan_text: userPenandatanganan,
          syarat_pencairan_text: userPencairan,
        },
      };

      const context = await TemplateContextBuilder.prepareTemplateContext(client);

      const penandatangananList = context.list_syarat_penandatanganan as { text: string }[];
      const pencairanList = context.list_syarat_pencairan as { text: string }[];

      // Verify header lines stripped
      expect(penandatangananList[0].text).not.toContain("Syarat Penandatanganan :");
      expect(pencairanList[0].text).not.toContain("Syarat Pencairan :");
      expect(pencairanList[0].text).not.toContain("Pencairan Kredit akan dilakukan dengan cara sebagai berikut :");

      // Verify /* commented lines stripped
      expect(penandatangananList.some(item => item.text.includes("Pas Foto"))).toBe(false);
      expect(pencairanList.some(item => item.text.includes("Bank Sulutgo"))).toBe(false);

      // Verify literal \n lines parsed into separate array elements
      expect(penandatangananList.length).toBeGreaterThan(15);
      expect(pencairanList.length).toBe(6);

      // Verify dash stripped
      expect(penandatangananList[0].text.startsWith("-")).toBe(false);
      expect(pencairanList[0].text.startsWith("-")).toBe(false);
      expect(penandatangananList[0].text).toContain("Hendra Supriadi");
    });
  });
});
