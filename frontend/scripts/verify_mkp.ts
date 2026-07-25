
import { ListGenerators } from "../src/backend/services/document/list-generators";

const mockContext: Record<string, unknown> = {
  instansi: "PT. Mitra Karya Prima",
  kategori: "type_c_baru",
  alamat_ktp: "Dusun III Desa Dumati Kecamatan Telaga Biru Kabupaten Gorontalo Provinsi Gorontalo",
  status_rumah: "Rumah Keluarga",
  lama_tinggal: "5 Tahun 04 Bulan",
  cfm_status_perkawinan: "Pemohon berstatus menikah Cfm. Kutipan Akta Nikah Nomor terlampir.",
  status_perkawinan: "Menikah",
  usia_pemohon: 26,
  tgl_lahir: "31-08-1999",
  no_ktp: "7501023108900002",
  tgl_terbit_ktp: "18-03-2022",
  status_kepegawaian_manual: "Karyawan Tetap",
  masa_kerja: "6 Tahun",
  tgl_mulai_kerja: "01-11-2019",
  no_sk_cpns: "182/SK-PK/A.03.03/2019",
  tgl_sk_cpns: "30-12-2019",
  penempatan_unit: "PLTU Anggrek di Desa Ilongota Kecamatan Anggrek Kabupaten Gorontalo Utara Provinsi Gorontalo",
  jabatan: "Operator Coal Handling MKP Unit PLTU Anggrek 2x25 MW",
  tgl_sk_kenaikan_pangkat: "12-12-2025",
  plafon: "200.000.000",
  tenor: "96",
  tujuan_kredit: "Biaya Konsumtif Lainnya"
};

console.log("Testing PT. Mitra Karya Prima Generation...");
const result = ListGenerators.generateInvestigasiList(mockContext);

console.log("\nGenerated List:");
result.forEach((item, index) => {
  console.log(`${index + 1}. ${item.text}`);
});
