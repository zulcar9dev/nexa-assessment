import { TemplateContextBuilder } from './src/backend/services/document/template-context';
import { ClientData } from './src/backend/services/document/types';

// Helper to make a base debitur object
function createMockDebitur(kategori: string, segmentasi: string, dataLengkap: Record<string, any>): ClientData {
  return {
    applicantName: "Budi Santoso",
    idNumber: "1234567890123456",
    kategori: kategori,
    jenisPengajuan: "baru",
    segmentasi: segmentasi,
    dataLengkap: {
      nama_pemohon: "Budi Santoso",
      no_ktp_pemohon: "1234567890123456",
      tgl_lahir_pemohon: "1980-05-15",
      alamat_ktp: "Jl. Sudirman No. 12",
      no_telepon: "081234567890",
      status_perkawinan: "menikah",
      instansi: "PT BUMN Sukses Jaya",
      status_kepegawaian_manual: "Pegawai Tetap",
      tgl_mulai_kerja: "2010-01-01",
      nama_bank_pembayaran: "Nexa",
      payroll_no_rek: "987654321",
      ...dataLengkap
    }
  };
}

async function runTests() {
  console.log("=== STARTING INCOME LOGIC TESTS ===\n");

  // ----------------------------------------------------
  // Skenario 1: BUP Kosong (Aktif)
  // ----------------------------------------------------
  console.log("--- Scenario 1: BUP Kosong (Aktif) ---");
  const debiturS1 = createMockDebitur("type_c", "BUMN_BUMD", {
    tgl_pensiun_tmt: "",
    tgl_pensiun_pemohon: "",
    gaji_bulan_1_jumlah: "5.000.000",
    gaji_bulan_2_jumlah: "5.000.000",
    gaji_bulan_3_jumlah: "5.000.000",
  });
  const ctxS1 = await TemplateContextBuilder.prepareTemplateContext(debiturS1);
  const listInvS1 = ctxS1.list_investigasi as Array<{ text: string }>;
  const hasBupS1 = listInvS1.some(item => item.text.includes("Batas Usia Pensiun") || item.text.includes("Pensiun"));
  console.log("BUP sentence printed?", hasBupS1 ? "YES (FAILED)" : "NO (PASSED)");
  console.log("No 'per Tanggal -' exists in list?", !listInvS1.some(item => item.text.includes("per Tanggal -")) ? "PASSED" : "FAILED");
  console.log("");

  // ----------------------------------------------------
  // Skenario 2: Hanya Gaji
  // ----------------------------------------------------
  console.log("--- Scenario 2: Hanya Gaji ---");
  const debiturS2 = createMockDebitur("type_c", "BUMN_BUMD", {
    gaji_bulan_1_jumlah: "5.000.000",
    gaji_bulan_2_jumlah: "5.000.000",
    gaji_bulan_3_jumlah: "5.000.000",
    additional_incomes: []
  });
  const ctxS2 = await TemplateContextBuilder.prepareTemplateContext(debiturS2);
  const listVerS2 = ctxS2.list_verifikasi_bendahara as Array<{ text: string }>;
  const listPenghasilanS2 = ctxS2.list_verifikasi_penghasilan_type_c as Array<{ text: string }>;
  
  const invTextS2 = listVerS2.find(item => item.text.includes("berkisar Rp."));
  console.log("Investigasi Text:", invTextS2?.text);
  console.log("Mentions 'Gaji' only?", invTextS2?.text.includes("Gaji Pemohon") && !invTextS2?.text.includes("Tunjangan") ? "PASSED" : "FAILED");
  
  const hasGajiRowS2 = listPenghasilanS2.some(item => item.text.includes("Gaji Bulan"));
  const hasTunjanganRowS2 = listPenghasilanS2.some(item => item.text.includes("Tunjangan") || item.text.includes("Tukin"));
  console.log("Has Gaji rows?", hasGajiRowS2 ? "PASSED" : "FAILED");
  console.log("Has Tunjangan rows?", hasTunjanganRowS2 ? "FAILED" : "PASSED (correctly omitted)");
  
  const titleS2 = listPenghasilanS2[0].text;
  const subHeaderS2 = listPenghasilanS2[1].text;
  console.log("Header Title correct?", titleS2 === "VERIFIKASI GAJI PEMOHON" ? "PASSED" : "FAILED");
  console.log("Sub-header correct?", subHeaderS2.startsWith("Gaji Pemohon Cfm.") ? "PASSED" : "FAILED");
  console.log("Tujuan Call correct?", ctxS2.tujuan_call === "Konfirmasi Gaji Pemohon" ? "PASSED" : "FAILED");
  console.log("RPC Aktif Header correct?", String(ctxS2.list_rpc_type_c).includes("Slip Gaji dan Rekening Koran Gaji") ? "PASSED" : "FAILED");
  console.log("");

  // ----------------------------------------------------
  // Skenario 3: Hanya Tunjangan (e.g. Tukin)
  // ----------------------------------------------------
  console.log("--- Scenario 3: Hanya Tunjangan ---");
  const debiturS3 = createMockDebitur("type_c", "BUMN_BUMD", {
    gaji_bulan_1_checked: false,
    gaji_bulan_2_checked: false,
    gaji_bulan_3_checked: false,
    additional_incomes: [
      {
        label: "Tunjangan Kinerja",
        bulan_1: "3.000.000",
        bulan_1_checked: true,
        bulan_2: "3.000.000",
        bulan_2_checked: true,
        bulan_3: "3.000.000",
        bulan_3_checked: true,
        bulan_1_nama: "Januari",
        bulan_2_nama: "Februari",
        bulan_3_nama: "Maret"
      }
    ]
  });
  const ctxS3 = await TemplateContextBuilder.prepareTemplateContext(debiturS3);
  const listVerS3 = ctxS3.list_verifikasi_bendahara as Array<{ text: string }>;
  const listPenghasilanS3 = ctxS3.list_verifikasi_penghasilan_type_c as Array<{ text: string }>;
  
  const invTextS3 = listVerS3.find(item => item.text.includes("berkisar Rp."));
  console.log("Investigasi Text:", invTextS3?.text);
  console.log("Mentions 'Tunjangan Kinerja' only?", invTextS3?.text.includes("Tunjangan Kinerja Pemohon") && !invTextS3?.text.includes("Gaji") ? "PASSED" : "FAILED");
  
  const hasGajiRowS3 = listPenghasilanS3.some(item => item.text.includes("Gaji Bulan"));
  const hasTunjanganRowS3 = listPenghasilanS3.some(item => item.text.includes("Tunjangan Kinerja"));
  console.log("Has Gaji rows?", hasGajiRowS3 ? "FAILED" : "PASSED (correctly omitted)");
  console.log("Has Tunjangan rows?", hasTunjanganRowS3 ? "PASSED" : "FAILED");
  
  const titleS3 = listPenghasilanS3[0].text;
  const subHeaderS3 = listPenghasilanS3[1].text;
  console.log("Header Title correct?", titleS3 === "VERIFIKASI TUNJANGAN PEMOHON" ? "PASSED" : "FAILED");
  console.log("Sub-header correct?", subHeaderS3.startsWith("Tunjangan Pemohon Cfm.") ? "PASSED" : "FAILED");
  console.log("Tujuan Call correct?", ctxS3.tujuan_call === "Konfirmasi Tunjangan Pemohon" ? "PASSED" : "FAILED");
  console.log("RPC Aktif Header correct?", String(ctxS3.list_rpc_type_c).includes("Slip Tunjangan dan Rekening Koran Tunjangan") ? "PASSED" : "FAILED");
  console.log("");

  // ----------------------------------------------------
  // Skenario 4: Hanya Uang Makan
  // ----------------------------------------------------
  console.log("--- Scenario 4: Hanya Uang Makan ---");
  const debiturS4 = createMockDebitur("type_c", "BUMN_BUMD", {
    gaji_bulan_1_checked: false,
    gaji_bulan_2_checked: false,
    gaji_bulan_3_checked: false,
    additional_incomes: [
      {
        label: "Uang Makan",
        bulan_1: "600.000",
        bulan_1_checked: true,
        bulan_2: "600.000",
        bulan_2_checked: true,
        bulan_3: "600.000",
        bulan_3_checked: true,
        bulan_1_nama: "Januari",
        bulan_2_nama: "Februari",
        bulan_3_nama: "Maret"
      }
    ]
  });
  const ctxS4 = await TemplateContextBuilder.prepareTemplateContext(debiturS4);
  const listVerS4 = ctxS4.list_verifikasi_bendahara as Array<{ text: string }>;
  const listPenghasilanS4 = ctxS4.list_verifikasi_penghasilan_type_c as Array<{ text: string }>;
  
  const invTextS4 = listVerS4.find(item => item.text.includes("berkisar Rp."));
  console.log("Investigasi Text:", invTextS4?.text);
  console.log("Mentions 'Uang Makan' only?", invTextS4?.text.includes("Uang Makan Pemohon") && !invTextS4?.text.includes("Gaji") ? "PASSED" : "FAILED");
  
  const titleS4 = listPenghasilanS4[0].text;
  const subHeaderS4 = listPenghasilanS4[1].text;
  console.log("Header Title correct?", titleS4 === "VERIFIKASI UANG MAKAN PEMOHON" ? "PASSED" : "FAILED");
  console.log("Sub-header correct?", subHeaderS4.startsWith("Uang Makan Pemohon Cfm.") ? "PASSED" : "FAILED");
  console.log("Tujuan Call correct?", ctxS4.tujuan_call === "Konfirmasi Uang Makan Pemohon" ? "PASSED" : "FAILED");
  console.log("RPC Aktif Header correct?", String(ctxS4.list_rpc_type_c).includes("Slip Uang Makan dan Rekening Koran Uang Makan") ? "PASSED" : "FAILED");
  console.log("");

  // ----------------------------------------------------
  // Skenario 5: Gabungan (Gaji + Tukin + Uang Makan)
  // ----------------------------------------------------
  console.log("--- Scenario 5: Gabungan (Gaji + Tukin + Uang Makan) ---");
  const debiturS5 = createMockDebitur("type_c", "BUMN_BUMD", {
    gaji_bulan_1_jumlah: "4.500.000",
    gaji_bulan_2_jumlah: "4.500.000",
    gaji_bulan_3_jumlah: "4.500.000",
    additional_incomes: [
      {
        label: "Tunjangan Kinerja",
        bulan_1: "3.000.000",
        bulan_1_checked: true,
        bulan_2: "3.000.000",
        bulan_2_checked: true,
        bulan_3: "3.000.000",
        bulan_3_checked: true,
        bulan_1_nama: "Januari",
        bulan_2_nama: "Februari",
        bulan_3_nama: "Maret"
      },
      {
        label: "Uang Makan",
        bulan_1: "600.000",
        bulan_1_checked: true,
        bulan_2: "600.000",
        bulan_2_checked: true,
        bulan_3: "600.000",
        bulan_3_checked: true,
        bulan_1_nama: "Januari",
        bulan_2_nama: "Februari",
        bulan_3_nama: "Maret"
      }
    ]
  });
  const ctxS5 = await TemplateContextBuilder.prepareTemplateContext(debiturS5);
  const listVerS5 = ctxS5.list_verifikasi_bendahara as Array<{ text: string }>;
  const listPenghasilanS5 = ctxS5.list_verifikasi_penghasilan_type_c as Array<{ text: string }>;
  
  const invTextS5 = listVerS5.find(item => item.text.includes("berkisar Rp."));
  console.log("Investigasi Text:", invTextS5?.text);
  console.log("Mentions all 3 components with nominals?", 
    invTextS5?.text.includes("Gaji berkisar Rp. 4.500.000") && 
    invTextS5?.text.includes("Tunjangan Kinerja berkisar Rp. 3.000.000") && 
    invTextS5?.text.includes("Uang Makan berkisar Rp. 600.000") &&
    invTextS5?.text.includes("Total Rp. 8.100.000")
    ? "PASSED" : "FAILED"
  );
  
  const titleS5 = listPenghasilanS5[0].text;
  const subHeaderS5 = listPenghasilanS5[1].text;
  console.log("Header Title correct?", titleS5 === "VERIFIKASI PENGHASILAN PEMOHON" ? "PASSED" : "FAILED");
  console.log("Sub-header correct?", subHeaderS5.startsWith("Penghasilan Pemohon Cfm.") ? "PASSED" : "FAILED");
  console.log("Tujuan Call correct?", ctxS5.tujuan_call === "Konfirmasi Penghasilan Pemohon" ? "PASSED" : "FAILED");
  console.log("RPC Aktif Header correct?", String(ctxS5.list_rpc_type_c).includes("Slip Penghasilan dan Rekening Koran Penghasilan") ? "PASSED" : "FAILED");
  
  console.log("Total rows in Verifikasi list:", listPenghasilanS5.length - 2); // subtract header rows
  
  const hasGajiLabelRow = listPenghasilanS5.some(row => row.text.startsWith("-Gaji Bulan"));
  const hasPenghasilanLabelRow = listPenghasilanS5.some(row => row.text.startsWith("-Penghasilan Bulan"));
  console.log("Gaji rows correctly labelled as 'Gaji' instead of 'Penghasilan'?", hasGajiLabelRow && !hasPenghasilanLabelRow ? "PASSED" : "FAILED");
  console.log("\n=== TESTS COMPLETED ===");
}

runTests().catch(console.error);
