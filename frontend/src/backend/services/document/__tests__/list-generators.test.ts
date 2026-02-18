
import { ListGenerators } from '../list-generators';

// Moking dependencies if necessary, but for now we test logic with real helpers if available
// Assuming helpers are simple. If not, we might need to mock @/lib/utils etc.

describe('ListGenerators', () => {
  const baseContext = {
    nama_pemohon: 'John Doe',
    alamat_ktp: 'Jl. KTP No. 1',
    status_rumah: 'Milik Sendiri',
    lama_tinggal: '5 Tahun',
    usia_pemohon: '30',
    tgl_lahir: '01-01-1990',
    no_ktp: '1234567890',
    tgl_terbit_ktp: '01-01-2010',
    cfm_status_perkawinan: 'Menikah',
    status_kepegawaian_manual: 'Pegawai Tetap',
    instansi: 'PT. Test',
    alamat_kantor: 'Jl. Kantor No. 1',
    masa_kerja: '2 Tahun',
    tgl_mulai_kerja: '01-01-2020',
    no_sk_cpns: 'SK-001',
    tgl_sk_cpns: '01-01-2020',
    jabatan: 'Staff',
    plafon: '100.000.000',
    tenor: '60',
    tujuan_kredit: 'Renovasi Rumah',
    kategori: 'Aktif',
  };

  describe('generateInvestigasiList', () => {
    it('should generate for PT. Mitra Karya Prima (MKP)', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Mitra Karya Prima',
        segmentasi: 'BUMN_BUMD',
        penempatan_unit: 'Unit Surabaya',
        tgl_sk_kenaikan_pangkat: '01-01-2021',
      };
      
      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');
      
      expect(text).toContain('Mitra Karya Prima');
      expect(text).toContain('JBC Blok A No 4-6'); // Hardcoded address
      expect(text).toContain('Daftar Kelolaan SLN');
    });

    it('should generate for Kejaksaan Negeri', () => {
      const context = {
        ...baseContext,
        instansi: 'Kejaksaan Negeri Jakarta',
        segmentasi: 'PEMERINTAHAN',
        golongan: 'III/a',
        no_sk_kenaikan_pangkat: 'SK-P-001',
        tgl_sk_kenaikan_pangkat: '01-01-2021',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Kejaksaan Negeri');
      expect(text).toContain('Daftar Kelolaan HLB');
      expect(text).toContain('III/a');
    });

    it('should generate for Universitas Negeri Gorontalo (UNG)', () => {
      const context = {
        ...baseContext,
        instansi: 'Universitas Negeri Gorontalo',
        segmentasi: 'PEMERINTAHAN',
        golongan: 'IV/a',
        no_sk_kenaikan_pangkat: 'SK-UNG-001',
        tgl_sk_kenaikan_pangkat: '01-01-2022',
        tgl_pensiun: '01-01-2050',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Universitas Negeri Gorontalo');
      expect(text).toContain('Kementrian Riset Tekhnologi dan Pendidikan Tinggi'); // Hardcoded info
      expect(text).toContain('Batas Usia Pensiun');
    });

    it('should generate for Standard BUMN/BUMD', () => {
        const context = {
            ...baseContext,
            instansi: 'PT. Telkom',
            segmentasi: 'BUMN_BUMD',
        };

        const result = ListGenerators.generateInvestigasiList(context);
        const text = result.map(r => r.text).join('\n');

        expect(text).toContain('PT. Telkom');
        expect(text).not.toContain('Daftar Kelolaan EQ'); // Should not have specific info unless configured
        // Check for standard points
        expect(text).toContain('Alamat Pemohon sesuai KTP');
    });

    it('should generate for Standard Pemerintahan', () => {
        const context = {
            ...baseContext,
            instansi: 'Dinas Kesehatan',
            segmentasi: 'PEMERINTAHAN',
            golongan: 'III/b',
        };

        const result = ListGenerators.generateInvestigasiList(context);
        const text = result.map(r => r.text).join('\n');

        expect(text).toContain('Dinas Kesehatan');
        expect(text).not.toContain('Daftar Kelolaan HLB'); // Should not have specific info
    });

    it('should generate for RSUD Drg Clara Gobel', () => {
      const context = {
        ...baseContext,
        instansi: 'RSUD Drg Clara Gobel',
        segmentasi: 'PEMERINTAHAN',
        golongan: 'IV/a',
        no_sk_kenaikan_pangkat: 'SK-P-001',
        tgl_sk_kenaikan_pangkat: '04-10-2022',
        no_sk_cpns: '813.2/BKD-DIKLAT/SK/III/116/2006',
        tgl_sk_cpns: '31-03-2006',
        jabatan: 'Kepala Bidang Keperawatan',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('RSUD Drg Clara Gobel');
      expect(text).toContain('PKS No GTL/5.2/006/2025');
      expect(text).toContain('Kepala Bidang Keperawatan');
      expect(text).toContain('IV/a'); // Should have Golongan
      expect(text).not.toContain('Batas Usia Pensiun'); // Should NOT have BUP
    });
  });

  describe('generateKepegawaianList', () => {
    it('should include SDM name and phone when provided', () => {
      const context = {
        ...baseContext,
        instansi: 'Perumda Air Minum Tirta Boalemo',
        segmentasi: 'BUMN_BUMD',
        kategori: 'Aktif',
        nama_sdm: 'Ibu Wisda',
        no_hp_sdm: '085394088377',
        gaji_bulan_3: '5.000.000',
        payroll_bank: 'BNI',
      };

      const result = ListGenerators.generateKepegawaianList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Ibu Wisda');
      expect(text).toContain('085394088377');
      expect(text).toContain('SDM/Kepegawaian');
    });

    it('should fallback gracefully when SDM data is empty string', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Test BUMN',
        segmentasi: 'BUMN_BUMD',
        kategori: 'Aktif',
        nama_sdm: '',
        no_hp_sdm: '',
        gaji_bulan_3: '5.000.000',
        payroll_bank: 'BNI',
      };

      const result = ListGenerators.generateKepegawaianList(context);
      const text = result.map(r => r.text).join('\n');

      // Should fallback to generic text without name
      expect(text).toContain('Informasi diperoleh dari Bagian SDM/Kepegawaian.');
      expect(text).not.toContain('Bpk/Ibu');
    });

    it('should fallback gracefully when SDM data is undefined', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Test BUMN',
        segmentasi: 'BUMN_BUMD',
        kategori: 'Aktif',
        gaji_bulan_3: '5.000.000',
        payroll_bank: 'BNI',
      };

      const result = ListGenerators.generateKepegawaianList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Informasi diperoleh dari Bagian SDM/Kepegawaian.');
      expect(text).not.toContain('Bpk/Ibu');
    });
  });
});
