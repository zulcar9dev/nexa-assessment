document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. HELPER FUNCTIONS (FORMATTING)
    // ==========================================
    function unformatRupiah(value) {
        return value.replace(/[^0-9]/g, '');
    }

    function formatRupiah(value) {
        let number_string = value.replace(/[^0-9]/g, '');
        number_string = number_string.replace(/^0+/, '');
        if (number_string === "") return "";
        return number_string.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }

    function setupRupiahInput(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            // Format awal saat load (jika ada nilai dari server)
            if (input.value) input.value = formatRupiah(input.value);
            
            input.addEventListener('input', function(e) {
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;
                let originalLength = e.target.value.length;

                e.target.value = formatRupiah(e.target.value);

                let newLength = e.target.value.length;
                let diff = newLength - originalLength;

                if (start === end && diff < 0) {
                    e.target.setSelectionRange(start + diff + 1, end + diff + 1);
                } else {
                    e.target.setSelectionRange(start + diff, end + diff);
                }
            });
        }
    }

    const angka = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    function terbilang(n) {
        n = Math.floor(n);
        if (n < 12) return angka[n];
        if (n < 20) return angka[n - 10] + ' belas';
        if (n < 100) return angka[Math.floor(n / 10)] + ' puluh ' + angka[n % 10];
        if (n < 200) return 'seratus ' + terbilang(n - 100);
        if (n < 1000) return angka[Math.floor(n / 100)] + ' ratus ' + terbilang(n % 100);
        if (n < 2000) return 'seribu ' + terbilang(n - 1000);
        if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu ' + terbilang(n % 1000);
        if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta ' + terbilang(n % 1000000);
        return '';
    }

    function updateTerbilang(inputElement, outputElement) {
        if (!inputElement || !outputElement) return;
        const nilai = parseFloat(inputElement.value) || 0;
        if (nilai === 0) {
            outputElement.value = '';
            return;
        }
        let hasil = terbilang(nilai).trim().replace(/\s+/g, ' ');
        hasil = hasil.charAt(0).toUpperCase() + hasil.slice(1);
        outputElement.value = hasil;
    }

    // ==========================================
    // 2. LOGIKA KALKULASI (UMUR, KERJA, BIAYA)
    // ==========================================
    const tglLahirInput = document.getElementById('tgl_lahir_pemohon');
    const usiaInput = document.getElementById('usia_pemohon');
    const tglMulaiKerjaInput = document.getElementById('tgl_mulai_kerja');
    const lamaKerjaInput = document.getElementById('lama_kerja_tahun');

    function hitungUsia() {
        if (!tglLahirInput || !tglLahirInput.value) {
            if (usiaInput) usiaInput.value = '';
            return;
        }
        try {
            const tglLahir = new Date(tglLahirInput.value);
            const hariIni = new Date();
            let usia = hariIni.getFullYear() - tglLahir.getFullYear();
            const selisihBulan = hariIni.getMonth() - tglLahir.getMonth();
            if (selisihBulan < 0 || (selisihBulan === 0 && hariIni.getDate() < tglLahir.getDate())) {
                usia--;
            }
            if (usiaInput) usiaInput.value = usia;
        } catch (e) {
            if (usiaInput) usiaInput.value = '';
        }
    }

    function hitungLamaKerja() {
        if (!tglMulaiKerjaInput || !lamaKerjaInput) return;
        if (!tglMulaiKerjaInput.value) {
            lamaKerjaInput.value = '';
            return;
        }
        try {
            const tglMulai = new Date(tglMulaiKerjaInput.value);
            const hariIni = new Date();
            const selisihMs = hariIni.getTime() - tglMulai.getTime();
            const selisihTahun = selisihMs / (1000 * 60 * 60 * 24 * 365.25);
            lamaKerjaInput.value = Math.floor(selisihTahun);
        } catch (e) {
            lamaKerjaInput.value = '';
        }
    }

    // Elemen Biaya
    const plafonUsulanInput = document.getElementById('usulan_plafon_kredit');
    const provisiPersenInput = document.getElementById('biaya_provisi_persen');
    const provisiNominalInput = document.getElementById('biaya_provisi_nominal');
    const tataLaksanaPersenInput = document.getElementById('biaya_tata_laksana_persen');
    const tataLaksanaNominalInput = document.getElementById('biaya_tata_laksana_nominal');

    function hitungBiaya() {
        if (!plafonUsulanInput) return;
        const plafon = parseFloat(unformatRupiah(plafonUsulanInput.value)) || 0;
        
        if (provisiPersenInput && provisiNominalInput) {
            const provisiPersen = parseFloat(provisiPersenInput.value) || 0;
            const provisiNominal = Math.round((plafon * provisiPersen) / 100);
            provisiNominalInput.value = formatRupiah(String(provisiNominal));
        }
        
        if (tataLaksanaPersenInput && tataLaksanaNominalInput) {
            const tataLaksanaPersen = parseFloat(tataLaksanaPersenInput.value) || 0;
            const tataLaksanaNominal = Math.round((plafon * tataLaksanaPersen) / 100);
            tataLaksanaNominalInput.value = formatRupiah(String(tataLaksanaNominal));
        }
    }

    // ==========================================
    // 3. KALKULASI KREDIT (PMT & DSR)
    // ==========================================
    const plafonDimohonInput = document.getElementById('plafon_kredit_dimohon');
    const jangkaWaktuDimohonInput = document.getElementById('jangka_waktu_dimohon_bulan');
    const jangkaWaktuUsulanInput = document.getElementById('usulan_jangka_waktu_bulan');
    const bungaUsulanInput = document.getElementById('usulan_bunga_persen');
    const angsuranUsulanInput = document.getElementById('usulan_angsuran');
    const dsrPemohonInput = document.getElementById('dsr_pemohon');
    const toggleNihil = document.getElementById('toggle-fasilitas-nihil');

    function syncPengajuanKeUsulan() {
        if (plafonDimohonInput && plafonUsulanInput) {
            plafonUsulanInput.value = plafonDimohonInput.value;
        }
        if (jangkaWaktuDimohonInput && jangkaWaktuUsulanInput) {
            jangkaWaktuUsulanInput.value = jangkaWaktuDimohonInput.value;
        }
        hitungBiaya(); // Hitung biaya ulang saat plafon berubah
        calculateNewPMT();
    }

    function calculateNewPMT() {
        if (!plafonUsulanInput || !bungaUsulanInput || !jangkaWaktuUsulanInput || !angsuranUsulanInput) return;

        const P = parseFloat(unformatRupiah(plafonUsulanInput.value)) || 0;
        const annualRate = parseFloat(bungaUsulanInput.value) || 0;
        const N = parseInt(jangkaWaktuUsulanInput.value) || 0;

        if (P === 0 || N === 0) {
            angsuranUsulanInput.value = '';
            calculateDSR();
            return;
        }
        if (annualRate === 0) {
            const pmt = Math.ceil(P / N);
            angsuranUsulanInput.value = formatRupiah(String(pmt));
            calculateDSR();
            return;
        }
        const R = (annualRate / 100) / 12;
        const pmt = (P * (R * Math.pow(1 + R, N))) / (Math.pow(1 + R, N) - 1);
        const pmtRounded = Math.ceil(pmt);
        angsuranUsulanInput.value = formatRupiah(String(pmtRounded));
        calculateDSR();
    }

    function calculateDSR() {
        if (!angsuranUsulanInput || !dsrPemohonInput) return;

        // --- DETEKSI SUMBER PENGHASILAN (Flexible untuk semua form) ---
        // 1. Coba ambil Prapurna (Estimasi Hak Pensiun)
        // 2. Coba ambil Purna Takeover (Gaji Bulan 3)
        // 3. Coba ambil Purna Reguler (Gaji Pensiun tunggal)
        let incomeElement = document.getElementById('estimasi_hak_pensiun') || 
                            document.getElementById('pensiun_bulan_3_jumlah') || 
                            document.getElementById('pensiun_bulan_jumlah');
                            
        const penghasilan = incomeElement ? parseFloat(unformatRupiah(incomeElement.value)) || 0 : 0;
        const angsuranUsulan = parseFloat(unformatRupiah(angsuranUsulanInput.value)) || 0;

        let totalAngsuranEksisting = 0;
        if (toggleNihil && !toggleNihil.checked) {
            for (let i = 1; i <= 15; i++) {
                const angsuranInput = document.getElementById('slik_bank_' + i + '_angsuran');
                if (angsuranInput) {
                    totalAngsuranEksisting += parseFloat(unformatRupiah(angsuranInput.value)) || 0;
                }
            }
        }

        const totalAngsuranBaru = angsuranUsulan + totalAngsuranEksisting;
        let dsr = 0;
        if (penghasilan > 0) {
            dsr = (totalAngsuranBaru / penghasilan) * 100;
        }
        dsrPemohonInput.value = dsr.toFixed(2);
    }

    // ==========================================
    // 4. TOGGLE HANDLERS (UI LOGIC)
    // ==========================================
    const allFacilitiesWrapper = document.getElementById('all-facilities-wrapper');
    const addSlikButton = document.getElementById('add-slik-facility');
    const toggleMitigasi = document.getElementById('toggle-mitigasi');
    const mitigasiFields = document.getElementById('mitigasi-fields');
    const toggleDomisili = document.getElementById('toggle-domisili');
    const domisiliFields = document.getElementById('domisili-fields');
    const biayaAdminInput = document.getElementById('biaya_administrasi');
    const bebasBiayaAdminCheckbox = document.getElementById('bebas_biaya_administrasi');

    function handleNihilToggle() {
        if (!toggleNihil || !allFacilitiesWrapper) return;
        const inputs = allFacilitiesWrapper.querySelectorAll('input, textarea');
        
        if (toggleNihil.checked) {
            allFacilitiesWrapper.style.display = 'none';
            inputs.forEach(input => input.disabled = true);
            if (addSlikButton) addSlikButton.disabled = true;
        } else {
            allFacilitiesWrapper.style.display = 'block';
            // Aktifkan kembali input, KECUALI textarea alasan yang harusnya disabled default
            inputs.forEach(input => {
                if (!input.classList.contains('disabled-default')) {
                    input.disabled = false;
                }
            });
            // Re-apply logic untuk alasan checkboxes
            document.querySelectorAll('.toggle-alasan').forEach(handleAlasanToggle);
            if (addSlikButton) addSlikButton.disabled = false;
        }
        calculateDSR();
    }

    function handleMitigasiToggle() {
        if (!toggleMitigasi || !mitigasiFields) return;
        const inputs = mitigasiFields.querySelectorAll('input, textarea');
        if (toggleMitigasi.checked) {
            mitigasiFields.style.display = 'block';
            inputs.forEach(input => input.disabled = false);
        } else {
            mitigasiFields.style.display = 'none';
            inputs.forEach(input => input.disabled = true);
        }
    }

    function handleDomisiliToggle() {
        if (!toggleDomisili || !domisiliFields) return;
        const inputs = domisiliFields.querySelectorAll('textarea');
        if (toggleDomisili.checked) {
            domisiliFields.style.display = 'block';
            inputs.forEach(input => input.disabled = false);
        } else {
            domisiliFields.style.display = 'none';
            inputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
        }
    }

    function handleBebasAdminToggle() {
        if (!bebasBiayaAdminCheckbox || !biayaAdminInput) return;
        if (bebasBiayaAdminCheckbox.checked) {
            biayaAdminInput.disabled = true;
            biayaAdminInput.value = '';
        } else {
            biayaAdminInput.disabled = false;
        }
    }

    function handleAlasanToggle(checkboxOrEvent) {
        // Bisa menerima event atau elemen checkbox langsung
        const checkbox = (checkboxOrEvent.target) ? checkboxOrEvent.target : checkboxOrEvent;
        const targetSelector = checkbox.dataset.targetAlasan;
        if (!targetSelector) return;
        
        const targetAlasan = document.querySelector(targetSelector);
        if (!targetAlasan) return;
        
        const wrapper = targetAlasan.closest('.alasan-wrapper');
        if (checkbox.checked) {
            if (wrapper) wrapper.style.display = 'block';
            targetAlasan.disabled = false;
            targetAlasan.classList.remove('disabled-default');
        } else {
            if (wrapper) wrapper.style.display = 'none';
            targetAlasan.disabled = true;
            targetAlasan.value = '';
            targetAlasan.classList.add('disabled-default');
        }
    }

    // --- LOGIKA JENIS PENGAJUAN (TOP UP) ---
    const radioJenisPengajuan = document.querySelectorAll('input[name="jenis_pengajuan"]');
    const containerTopUp = document.getElementById('field-topup-container');
    const containerPK = document.getElementById('field-no-pk-container');
    const inputRekening = document.getElementById('no_rekening_pinjaman');
    const inputPK = document.getElementById('no_pk_eksisting');

    function handleJenisPengajuanChange() {
        if (!containerTopUp) return;

        // Cari radio yang dipilih
        let selectedValue = 'baru';
        radioJenisPengajuan.forEach(radio => {
            if (radio.checked) selectedValue = radio.value;
        });

        if (selectedValue === 'baru') {
            // Sembunyikan Semua
            containerTopUp.style.display = 'none';
            if(inputRekening) inputRekening.disabled = true;
            if(inputPK) inputPK.disabled = true;
        
        } else if (selectedValue === 'top_up') {
            // Tampilkan Rekening SAJA
            containerTopUp.style.display = 'block';
            if(inputRekening) inputRekening.disabled = false;
            
            // Sembunyikan PK
            if(containerPK) containerPK.style.display = 'none';
            if(inputPK) inputPK.disabled = true;

        } else if (selectedValue === 'top_up_sisa_gaji') {
            // Tampilkan KEDUANYA
            containerTopUp.style.display = 'block';
            if(containerPK) containerPK.style.display = 'block';
            
            if(inputRekening) inputRekening.disabled = false;
            if(inputPK) inputPK.disabled = false;
        }
    }

    // Pasang Event Listener
    radioJenisPengajuan.forEach(radio => {
        radio.addEventListener('change', handleJenisPengajuanChange);
    });

    // Jalankan saat halaman dimuat (agar status tersimpan tetap terjaga)
    handleJenisPengajuanChange();

    // ==========================================
    // 5. SEGMENTASI (TASPEN/ASABRI)
    // ==========================================
    const segRadios = document.querySelectorAll('input[name="segmentasi"]');
    
    function updateLabelsBySegment() {
        let segmentasi = 'taspen';
        segRadios.forEach(r => { if(r.checked) segmentasi = r.value; });

        const isAsabri = (segmentasi === 'asabri');

        // Helper untuk ubah textContent label
        const setLabel = (id, textAsabri, textTaspen) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = isAsabri ? textAsabri : textTaspen;
        };

        // Mapping Label (Gabungan Purna & Prapurna)
        setLabel('nip_pemohon', 'NRP Pemohon', 'NIP Pemohon');
        setLabel('no_sk_cpns', 'No. SKEP Pengangkatan Pertama', 'No. SK CPNS');
        setLabel('tgl_sk_cpns', 'Tgl SKEP Pengangkatan Pertama', 'Tgl SK CPNS');
        setLabel('no_sk_golongan', 'No. SKEP Pangkat Terakhir', 'No. SK Golongan');
        setLabel('tgl_sk_golongan', 'Tgl SKEP Pangkat Terakhir', 'Tgl SK Golongan');
        setLabel('jenis_pekerjaan_pemohon', 'Kesatuan/Instansi', 'Jenis Pekerjaan'); // Untuk Prapurna
        
        // Khusus Purna (Istilah agak beda)
        // Cek apakah kita di form Purna (ada element no_sk_pensiun)
        if (document.getElementById('no_sk_pensiun')) {
             setLabel('jenis_pekerjaan_pemohon', 'Pensiunan Anggota (TNI/POLRI)', 'Jenis Pekerjaan (Pensiunan)');
             setLabel('no_sk_pensiun', 'No. SKEP Pensiun', 'No. SK Pensiun');
             setLabel('tgl_sk_pensiun', 'Tgl SKEP Pensiun', 'Tgl. SK Pensiun');
        }

        setLabel('golongan_saat_ini', 'Pangkat Saat Ini', 'Golongan Saat Ini');
    }

    // ==========================================
    // 6. INITIALIZATION & EVENTS
    // ==========================================
    
    // Setup Rupiah Input Otomatis untuk semua ID yang mungkin ada
    const nominalIDs = [
        'plafon_kredit_dimohon', 'usulan_plafon_kredit', 'usulan_angsuran',
        'gaji_bulan_1_jumlah', 'gaji_bulan_2_jumlah', 'gaji_bulan_3_jumlah',
        'pensiun_bulan_1_jumlah', 'pensiun_bulan_2_jumlah', 'pensiun_bulan_3_jumlah', 'pensiun_bulan_jumlah',
        'estimasi_hak_pensiun', 'taspen_tht', 'taspen_hak_pensiun',
        'biaya_provisi_nominal', 'biaya_tata_laksana_nominal', 'biaya_administrasi', 'info_gaji_bendahara'
    ];
    // Tambahkan SLIK 1-15
    for(let i=1; i<=15; i++) {
        nominalIDs.push(`slik_bank_${i}_maks`, `slik_bank_${i}_outs`, `slik_bank_${i}_angsuran`);
    }
    nominalIDs.forEach(setupRupiahInput);

    // Setup Terbilang
    const pairs = [
        { in: 'blokir_angsuran_total', out: 'blokir_angsuran_total_terbilang' },
        { in: 'blokir_angsuran_prapurna', out: 'blokir_angsuran_prapurna_terbilang' },
        { in: 'blokir_angsuran_pindah_gaji', out: 'blokir_angsuran_pindah_gaji_terbilang' },
        { in: 'blokir_angsuran_lunas', out: 'blokir_angsuran_lunas_terbilang' }
    ];
    pairs.forEach(p => {
        const elIn = document.getElementById(p.in);
        const elOut = document.getElementById(p.out);
        if(elIn && elOut) {
            updateTerbilang(elIn, elOut); // Init load
            elIn.addEventListener('input', () => updateTerbilang(elIn, elOut));
        }
    });

    // Event Listeners Kalkulasi
    if (tglLahirInput) tglLahirInput.addEventListener('change', hitungUsia);
    if (tglMulaiKerjaInput) tglMulaiKerjaInput.addEventListener('change', hitungLamaKerja);
    if (provisiPersenInput) provisiPersenInput.addEventListener('input', hitungBiaya);
    if (tataLaksanaPersenInput) tataLaksanaPersenInput.addEventListener('input', hitungBiaya);
    if (plafonDimohonInput) plafonDimohonInput.addEventListener('input', syncPengajuanKeUsulan);
    if (jangkaWaktuDimohonInput) jangkaWaktuDimohonInput.addEventListener('input', syncPengajuanKeUsulan);
    if (bungaUsulanInput) bungaUsulanInput.addEventListener('input', calculateNewPMT);
    
    // Listeners untuk DSR (Semua kemungkinan input gaji)
    ['estimasi_hak_pensiun', 'pensiun_bulan_3_jumlah', 'pensiun_bulan_jumlah'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', calculateDSR);
    });
    // Listener DSR untuk SLIK
    for(let i=1; i<=15; i++){
        const el = document.getElementById(`slik_bank_${i}_angsuran`);
        if(el) el.addEventListener('input', calculateDSR);
    }

    // Listeners UI Toggles
    if (toggleNihil) toggleNihil.addEventListener('change', handleNihilToggle);
    if (toggleMitigasi) toggleMitigasi.addEventListener('change', handleMitigasiToggle);
    if (toggleDomisili) toggleDomisili.addEventListener('change', handleDomisiliToggle);
    if (bebasBiayaAdminCheckbox) bebasBiayaAdminCheckbox.addEventListener('change', handleBebasAdminToggle);
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('toggle-alasan')) {
            handleAlasanToggle(e.target);
        }
    });
    segRadios.forEach(radio => radio.addEventListener('change', updateLabelsBySegment));

    // Dynamic SLIK Buttons
    if (addSlikButton) {
        addSlikButton.addEventListener('click', function() {
            let found = false;
            for (let i = 2; i <= 15; i++) {
                const row = document.getElementById('slik-facility-' + i);
                if (row && getComputedStyle(row).display === 'none') {
                    row.style.display = 'block';
                    found = true;
                    break;
                }
            }
            // Cek apakah masih ada yang hidden
            let anyHidden = false;
            for (let i = 2; i <= 15; i++) {
                const row = document.getElementById('slik-facility-' + i);
                if (row && getComputedStyle(row).display === 'none') anyHidden = true;
            }
            if (!anyHidden) addSlikButton.style.display = 'none';
        });
    }

    // Dynamic Syarat Buttons
    const addSyaratButton = document.getElementById('add-syarat-kustom');
    if (addSyaratButton) {
        addSyaratButton.addEventListener('click', function() {
            let found = false;
            for (let i = 1; i <= 10; i++) {
                const row = document.getElementById('syarat-kustom-' + i);
                if (row && getComputedStyle(row).display === 'none') {
                    row.style.display = 'block';
                    break;
                }
            }
            let anyHidden = false;
            for (let i = 1; i <= 10; i++) {
                const row = document.getElementById('syarat-kustom-' + i);
                if (row && getComputedStyle(row).display === 'none') anyHidden = true;
            }
            if(!anyHidden) addSyaratButton.style.display = 'none';
        });
    }

    // Generic Delete Buttons (SLIK & Syarat)
    document.addEventListener('click', function(e) {
        // Hapus SLIK
        if (e.target.classList.contains('slik-delete-btn')) {
            const id = e.target.dataset.facilityId;
            const row = document.getElementById('slik-facility-' + id);
            if (row) {
                row.style.display = 'none';
                row.querySelectorAll('input, textarea').forEach(input => {
                    input.value = '';
                    input.checked = false;
                });
                if(addSlikButton) addSlikButton.style.display = 'block';
                calculateDSR();
            }
        }
        // Hapus Syarat
        if (e.target.classList.contains('syarat-delete-btn')) {
            const id = e.target.dataset.syaratId;
            const row = document.getElementById('syarat-kustom-' + id);
            if (row) {
                row.style.display = 'none';
                row.querySelectorAll('input, textarea').forEach(input => {
                    input.value = '';
                    if(input.type==='radio' || input.type==='checkbox') input.checked = false;
                });
                if(addSyaratButton) addSyaratButton.style.display = 'block';
            }
        }
    });

    // PREVIEW MODAL LOGIC (Simplified populate)
    const mainForm = document.getElementById('mainForm');
    const previewModal = document.getElementById('previewModal');
    
    // Bootstrap 5 Modal Instance
    let bsModal = null;
    if(previewModal) {
        // Check if Bootstrap is loaded
        if (typeof bootstrap !== 'undefined') {
            bsModal = new bootstrap.Modal(previewModal);
        }
    }

    if (mainForm && bsModal) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!mainForm.checkValidity()) {
                mainForm.reportValidity();
                return;
            }
            
            // Populate Preview
            // 1. Text & Textarea
            mainForm.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="tel"], textarea, select').forEach(input => {
               const previewId = 'preview_' + input.id;
               const previewEl = document.getElementById(previewId);
               if(previewEl) previewEl.textContent = input.value;
            });

            // 2. Checkboxes (Takeover, etc)
            mainForm.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                const previewId = 'preview_' + chk.id;
                const previewEl = document.getElementById(previewId);
                if(previewEl) {
                    if (chk.id.includes('_takeover')) {
                        previewEl.textContent = chk.checked ? ' (Take Over)' : '';
                    }
                }
            });

            // 3. Segmentasi Badge
            const seg = document.querySelector('input[name="segmentasi"]:checked');
            const prevSeg = document.getElementById('preview_segmentasi');
            if(seg && prevSeg) {
                prevSeg.textContent = seg.value === 'asabri' ? 'ASABRI (TNI/POLRI)' : 'TASPEN (PNS)';
                prevSeg.className = seg.value === 'asabri' ? 'badge bg-success' : 'badge bg-primary';
            }
            // [BARU] Preview Jenis Pengajuan
            const jenisPengajuan = document.querySelector('input[name="jenis_pengajuan"]:checked');
            const previewJenis = document.getElementById('preview_jenis_pengajuan');
            
            if (previewJenis) {
                if (jenisPengajuan) {
                    let label = "Baru"; // Default text
                    if (jenisPengajuan.value === 'top_up') {
                        label = "Suplesi / Top Up";
                    } else if (jenisPengajuan.value === 'top_up_sisa_gaji') {
                        label = "Top Up Sisa Gaji";
                    }
                    previewJenis.textContent = label;
                } else {
                    previewJenis.textContent = "-";
                }
            }
            // 4. Visibility Sections (SLIK List, Syarat List)
            // ... (Logika visibility sama seperti sebelumnya, tapi sudah diringkas) ...
            // Note: Untuk ringkasnya, bagian ini bisa diandalkan pada helper display logic HTML 
            // atau tambahkan class .d-none di preview modal secara dinamis jika perlu.
            
            // Tampilkan Modal
            bsModal.show();
        });

        const confirmBtn = document.getElementById('confirm-save');
        if(confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                bsModal.hide();
                mainForm.submit();
            });
        }
    }

    // ==========================================
    // RUN ON LOAD
    // ==========================================
    // Jalankan fungsi-fungsi inisialisasi agar status UI sesuai data yang ada
    hitungUsia();
    hitungLamaKerja();
    syncPengajuanKeUsulan(); 
    updateLabelsBySegment();
    handleNihilToggle();
    handleMitigasiToggle();
    handleDomisiliToggle();
    handleBebasAdminToggle();
    document.querySelectorAll('.toggle-alasan').forEach(handleAlasanToggle);
    calculateDSR();

});