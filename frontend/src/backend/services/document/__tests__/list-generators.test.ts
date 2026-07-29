
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
            tgl_pensiun: '01-01-2050',
        };

        const result = ListGenerators.generateInvestigasiList(context);
        const text = result.map(r => r.text).join('\n');

        expect(text).toContain('PT. Telkom');
        expect(text).not.toContain('Daftar Kelolaan EQ'); // Should not have specific info unless configured
        // Check for standard points
        expect(text).toContain('Alamat Pemohon sesuai KTP');
        expect(text).toContain('Batas Usia Pensiun'); // Default BUMN has BUP
    });

    it('should NOT include BUP for PT. Mitra Karya Prima (MKP)', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Mitra Karya Prima',
        segmentasi: 'BUMN_BUMD',
      };
      
      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');
      
      expect(text).not.toContain('Batas Usia Pensiun');
      expect(text).not.toContain('pensiun');
    });

    it('should NOT include BUP for Paguntaka / Cahaya Nusantara', () => {
      const context = {
        ...baseContext,
        instansi: 'PT Paguntaka Jaya Utama',
        segmentasi: 'BUMN_BUMD',
      };
      
      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');
      
      expect(text).not.toContain('Batas Usia Pensiun');
    });

    it('should generate dynamic investigation text for PLN Nusa Daya with defaults', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Paguntaka Cahaya Nusantara (PLN Nusa Daya)',
        segmentasi: 'BUMN_BUMD',
        status_kepegawaian_manual: 'Pegawai PKWTT',
        masa_kerja: '1 Tahun 5 Bulan',
        tgl_mulai_kerja: '1 Januari 2025',
        no_sk_cpns: '16.PKWTT/ADD.I/PCN/I/2025',
        tgl_sk_cpns: '1 Januari 2025',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain(
        'Pemohon sebelumnya adalah Karyawan Kontrak pada Perusahaan PT Jaya Mahe (Vendor Outsourcing) dengan lama bekerja ± 6 Tahun sejak 1 Januari 2019'
      );
      expect(text).toContain(
        'dan saat ini sudah alih status menjadi Pegawai PKWTT pada PT. Paguntaka Cahaya Nusantara (PLN Nusa Daya) dengan lama bekerja ± 1 Tahun 5 Bulan sejak 1 Januari 2025'
      );
      expect(text).toContain(
        'Cfm. Surat Keputusan (SK) Pengangkatan Pegawai Nomor 16.PKWTT/ADD.I/PCN/I/2025 tanggal 1 Januari 2025'
      );
      expect(text).toContain('Alamat PT. Paguntaka Cahaya Nusantara (PLN Nusa Daya) di');
    });

    it('should generate dynamic investigation text for PLN Nusa Daya with custom inputs', () => {
      const context = {
        ...baseContext,
        instansi: 'PLN Nusa Daya',
        segmentasi: 'BUMN_BUMD',
        status_kepegawaian_manual: 'Pegawai Tetap',
        masa_kerja: '2 Tahun',
        tgl_mulai_kerja: '1 Maret 2024',
        no_sk_cpns: 'SK-PCN-001',
        tgl_sk_cpns: '1 Maret 2024',
        prev_status_kepegawaian: 'Magang',
        prev_instansi: 'PT Lain',
        prev_masa_kerja: '2 Tahun',
        prev_tgl_mulai_kerja: '1 Februari 2022',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain(
        'Pemohon sebelumnya adalah Magang pada Perusahaan PT Lain dengan lama bekerja ± 2 Tahun sejak 1 Februari 2022'
      );
      expect(text).toContain(
        'dan saat ini sudah alih status menjadi Pegawai Tetap pada PLN Nusa Daya dengan lama bekerja ± 2 Tahun sejak 1 Maret 2024'
      );
      expect(text).toContain(
        'Cfm. Surat Keputusan (SK) Pengangkatan Pegawai Nomor SK-PCN-001 tanggal 1 Maret 2024'
      );
    });

    it('should NOT include BUP for PLN ULP Kota Gorontalo (generic PLN)', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. PLN (Persero) ULP Kota Gorontalo',
        segmentasi: 'BUMN_BUMD',
      };
      
      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');
      
      expect(text).not.toContain('Batas Usia Pensiun');
      expect(text).not.toContain('Pensiun');
    });

    it('should include special BUP text for PLN UP3 Gorontalo', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. PLN (Persero) UP3 Gorontalo',
        segmentasi: 'BUMN_BUMD',
      };
      
      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');
      
      expect(text).toContain('Pemohon Pensiun sampai dengan usia 56 tahun');
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

    it('should show Golongan/Pangkat for PNS in Swasta segmentation ONLY for RSUD Drg Clara Gobel', () => {
      const context = {
        ...baseContext,
        instansi: 'RSUD Drg Clara Gobel',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Pegawai Negeri Sipil (PNS)',
        golongan: 'III/b',
        no_sk_kenaikan_pangkat: 'SK-PNS-CG-001',
        tgl_sk_kenaikan_pangkat: '15-06-2023',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Status/ Pangkat Golongan Pemohon saat ini adalah III/b');
      expect(text).toContain('SK-PNS-CG-001');
      expect(text).toContain('15-06-2023');
      
      const golonganIdx = text.indexOf('Status/ Pangkat Golongan');
      const jabatanIdx = text.indexOf('Jabatan Pemohon saat ini');
      expect(golonganIdx).toBeLessThan(jabatanIdx);
    });

    it('should NOT show Golongan/Pangkat for non-PNS in Swasta segmentation for RSUD Drg Clara Gobel', () => {
      const context = {
        ...baseContext,
        instansi: 'RSUD Drg Clara Gobel',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Karyawan Kontrak Swasta',
        golongan: '',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).not.toContain('Status/ Pangkat Golongan');
    });

    it('should NOT show Golongan/Pangkat for PNS in Swasta segmentation for other Swasta companies', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Astra International',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Pegawai Negeri Sipil (PNS)',
        golongan: 'III/b',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).not.toContain('Status/ Pangkat Golongan');
    });

    it('should generate for PT. Puncak Emas Tani Sejahtera (PETS)', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Puncak Emas Tani Sejahtera',
        segmentasi: 'SWASTA',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('PT. Puncak Emas Tani Sejahtera');
      expect(text).toContain('bergerak dibidang Pertambangan Emas');
      expect(text).toContain('Anak Perusahan dari PT. MDKA Group');
      expect(text).toContain('Kelolaan COB 2');
    });

    it('should generate for PT Pani Bersama Tambang (PBT) - Alih Status', () => {
      const context = {
        ...baseContext,
        instansi: 'PT Pani Bersama Tambang',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Karyawan Tetap',
        tgl_mulai_kerja: '1 Januari 2026',
        masa_kerja: '6 Bulan',
        no_sk_cpns: '011/PBT-PEA/I/2026',
        tgl_sk_cpns: '1 Januari 2026',
        prev_instansi: 'PT Puncak Emas Tani Sejahtera',
        prev_status_kepegawaian: 'Karyawan Tetap',
        prev_masa_kerja: '2 Tahun',
        prev_tgl_mulai_kerja: '01 Februari 2024',
        prev_no_sk: '010/PETS-PEA/I/2024',
        prev_tgl_sk: '01 Februari 2024',
        no_surat_pengalihan: '012/PETS-HR/I/2026',
        tgl_surat_pengalihan: '01 Januari 2026',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain(
        'Pemohon sebelumnya adalah Karyawan Tetap pada PT Puncak Emas Tani Sejahtera dengan lama bekerja 2 Tahun sejak 01 Februari 2024'
      );
      expect(text).toContain(
        'Cfm. Surat Perjanjian Kerja No. 010/PETS-PEA/I/2024 tanggal 01 Februari 2024'
      );
      expect(text).toContain(
        'kemudian dialihkan hubungan kerja Cfm Surat Pengalihan Pekerja No. 012/PETS-HR/I/2026 tanggal 01 Januari 2026'
      );
      expect(text).toContain(
        'menjadi Karyawan Tetap pada PT Pani Bersama Tambang dengan lama bekerja ± 6 Bulan sejak 1 Januari 2026 Cfm. Surat Perjanjian Kerja No 011/PBT-PEA/I/2026 tanggal 1 Januari 2026.'
      );
    });

    it('should generate for PT Pani Bersama Tambang (PBT) - Rekrutmen Baru', () => {
      const context = {
        ...baseContext,
        instansi: 'PT Pani Bersama Tambang',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Karyawan Tetap',
        tgl_mulai_kerja: '1 Maret 2026',
        masa_kerja: '4 Bulan',
        no_sk_cpns: '015/PBT-PEA/III/2026',
        tgl_sk_cpns: '1 Maret 2026',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).not.toContain('PT Puncak Emas Tani Sejahtera');
      expect(text).not.toContain('dialihkan hubungan kerja');
      expect(text).toContain(
        'Pemohon adalah Karyawan Tetap pada PT Pani Bersama Tambang dengan lama bekerja ± 4 Bulan sejak 1 Maret 2026 Cfm. Surat Perjanjian Kerja No 015/PBT-PEA/III/2026 tanggal 1 Maret 2026.'
      );
    });

    it('should generate business and group info for PT Pani Bersama Tambang (PBT)', () => {
      const context = {
        ...baseContext,
        instansi: 'PBT',
        segmentasi: 'SWASTA',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('PT. Pani Bersama Tambang');
      expect(text).toContain('bergerak dibidang Pertambangan Emas');
      expect(text).toContain('Anak Perusahan dari PT. MDKA Group');
      expect(text).toContain('Kelolaan COB 2');
    });

    it('should generate for Pelabuhan Perikanan Nusantara Kwandang', () => {
      const context = {
        ...baseContext,
        instansi: 'Pelabuhan Perikanan Nusantara Kwandang Kementerian Kelautan dan Perikanan',
        segmentasi: 'PEMERINTAHAN',
        alamat_ktp: 'Dusun Mangrove Desa Katialada Kecamatan Kwandang Kabupaten Gorontalo Utara',
        status_rumah: 'Rumah Kost',
        lama_tinggal: '00 tahun 02 bulan',
        cfm_status_perkawinan: 'Pemohon berstatus Menikah Cfm. Kutipan Akta Nikah No. xxx tanggal xxx.',
        usia_pemohon: '32',
        tgl_lahir: '02-07-1995',
        no_ktp: '7371144205950006',
        tgl_terbit_ktp: '03-10-2025',
        status_kepegawaian_manual: 'Pegawai P3K',
        tgl_mulai_kerja: '01-10-2025',
        raw_tgl_mulai_kerja: '2025-10-01',
        no_sk_cpns: '6/KEPMEN-KP/KP.320/IX/2025',
        tgl_sk_cpns: '16-09-2025',
        alamat_kantor: 'Jl Pelabuhan Kwandang Desa Katialada Kecamatan Kwandang Kabupaten Gorontalo Utara Provinsi Gorontalo',
        masa_kerja: '00 Tahun 1 Bulan 25 Hari',
        tgl_berakhir_pengangkatan: '30-09-2030',
        raw_tgl_berakhir_pengangkatan: '2030-09-30',
        golongan: 'IX',
        jabatan: 'Penata Layanan Operasional',
        plafon: '55.000.000',
        tenor: '36',
        tujuan_kredit: 'Pembelian Kendaraan',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Alamat Pemohon sesuai KTP di Dusun Mangrove Desa Katialada');
      expect(text).toContain('Status Rumah Pemohon saat ini adalah Rumah Kost');
      expect(text).toContain('Pemohon berstatus Menikah Cfm. Kutipan Akta Nikah No. xxx tanggal xxx.');
      expect(text).toContain('Pemohon berumur ± 32 Tahun (02-07-1995)');
      expect(text).toContain('Pemohon adalah Pegawai P3K di Pelabuhan Perikanan Nusantara Kwandang');
      expect(text).toContain('Alamat Kantor yang terletak di Jl Pelabuhan Kwandang');
      expect(text).toContain('Daftar Kelolaan SLN');
      expect(text).toContain('Lama Pemohon berdinas ± 00 Tahun 1 Bulan 25 Hari sejak 01-10-2025 s.d tanggal 30-09-2030 (Periode 5 Tahun). Cfm. SK Nomor 6/KEPMEN-KP/KP.320/IX/2025 tanggal 16-09-2025.');
      expect(text).toContain('Status/ Pangkat Golongan Pemohon saat ini adalah IX');
      expect(text).toContain('Jabatan Pemohon saat ini adalah Penata Layanan Operasional');
      expect(text).toContain('Maksud mengajukan Assessment Facility Fleksi sebesar Rp. 55.000.000');
      expect(text).toContain('Tujuan pengunaan assessment untuk Pembelian Kendaraan.');
    });

    it('should generate for Standard Pemerintahan with PPPK status', () => {
      const context = {
        ...baseContext,
        instansi: 'Dinas Kesehatan',
        segmentasi: 'PEMERINTAHAN',
        status_kepegawaian_manual: 'Pegawai PPPK',
        golongan: 'IX',
        tgl_mulai_kerja: '01-10-2025',
        raw_tgl_mulai_kerja: '2025-10-01',
        tgl_berakhir_pengangkatan: '30-09-2027',
        raw_tgl_berakhir_pengangkatan: '2027-09-30',
        no_sk_cpns: 'SK-PPPK-001',
        tgl_sk_cpns: '15-09-2025',
        masa_kerja: '2 Tahun',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Lama Masa Kerja Pemohon -/+ 2 Tahun atau sejak tanggal 01-10-2025 s.d tanggal 30-09-2027 (Periode 2 Tahun). Cfm. SK Pengangkatan PPPK No. SK-PPPK-001 tanggal 15-09-2025.');
    });

    it('should generate length of service and Surat Perjanjian Kerja for Swasta segment', () => {
      const context = {
        ...baseContext,
        instansi: 'PT. Astra Swasta',
        segmentasi: 'SWASTA',
        status_kepegawaian_manual: 'Karyawan Tetap',
        tgl_mulai_kerja: '01-01-2020',
        masa_kerja: '5 Tahun',
        no_sk_cpns: 'SPK-ASTR-123',
        tgl_sk_cpns: '01-01-2020',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Pemohon adalah Karyawan Tetap pada PT. Astra Swasta dengan lama bekerja ± 5 Tahun sejak 01-01-2020 Cfm. Surat Perjanjian Kerja No SPK-ASTR-123 tanggal 01-01-2020.');
    });

    it('should generate for PDAM Tirta Limutu / Perumda Air Minum Tirta Limutu', () => {
      const context = {
        ...baseContext,
        instansi: 'PDAM Tirta Limutu',
        segmentasi: 'BUMN_BUMD',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Penyaluran Fasilitas Nexa Assessment');
      expect(text).toContain('Perumda Air Minum Tirta Limutu');
      expect(text).toContain('GTL/PKS/005/2026');
      expect(text).toContain('29 Juni 2026');
      expect(text).toContain('10 Februari 2041');
      expect(text).not.toContain('Batas Usia Pensiun');
      expect(text).not.toContain('pensiun');
    });

    it('should generate for RSUD dr. Hi. Zainal Umar Sidiki (ZUS)', () => {
      const context = {
        ...baseContext,
        instansi: 'RSUD dr. Hi. Zainal Umar Sidiki (ZUS)',
        segmentasi: 'PEMERINTAHAN',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('RSUD dr. Hi. Zainal Umar Sidiki (ZUS)');
      expect(text).toContain('GTL/5.2/004/2024');
      expect(text).toContain('02 Januari 2024');
      expect(text).toContain('02 Januari 2029');
      expect(text).not.toContain('Batas Usia Pensiun');
    });

    it('should generate for KPU Kota Gorontalo', () => {
      const context = {
        ...baseContext,
        instansi: 'KPU Kota Gorontalo',
        segmentasi: 'PEMERINTAHAN',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('KPU Kota Gorontalo');
      expect(text).toContain('GTL/003/PKS/ 2022');
      expect(text).toContain('18 Agustus 2022');
      expect(text).not.toContain('Bone Bolango');
    });

    it('should generate for KPU Kabupaten Bone Bolango', () => {
      const context = {
        ...baseContext,
        instansi: 'KPU Kabupaten Bone Bolango',
        segmentasi: 'PEMERINTAHAN',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('KPU Kabupaten Bone Bolango');
      expect(text).toContain('GTL/009/PKS/2024');
      expect(text).toContain('21 Maret 2025');
      expect(text).toContain('21 Maret 2040');
      expect(text).not.toContain('Kota Gorontalo');
    });

    it('should use "Type B Assessment" for Purna kategori (BFP Purna)', () => {
      const context = {
        ...baseContext,
        kategori: 'type_b_baru',
        jenis_pengajuan: 'Baru',
        plafon: '100.000.000',
        tenor: '60',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Type B Assessment');
      expect(text).not.toContain('Type A Assessment');
    });

    it('should use "Type A Assessment" for Prapurna kategori (BFP Pra Purna)', () => {
      const context = {
        ...baseContext,
        kategori: 'type_a_baru',
        jenis_pengajuan: 'Baru',
        plafon: '100.000.000',
        tenor: '60',
      };

      const result = ListGenerators.generateInvestigasiList(context);
      const text = result.map(r => r.text).join('\n');

      expect(text).toContain('Type A Assessment');
      expect(text).not.toContain('Type B Assessment');
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
