document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. HELPER FUNCTIONS (FORMATTING)
    // ==========================================
    function unformatRupiah(value) {
        if (!value) return '';
        return value.replace(/[^0-9]/g, '');
    }

    function formatRupiah(value) {
        if (!value) return '';
        let number_string = value.replace(/[^0-9]/g, '');
        number_string = number_string.replace(/^0+/, '');
        if (number_string === "") return "";
        return number_string.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }

    // Fungsi Helper untuk trigger event secara manual jika dibutuhkan
    function triggerEvent(el, type) {
        if ('createEvent' in document) {
            var e = document.createEvent('HTMLEvents');
            e.initEvent(type, false, true);
            el.dispatchEvent(e);
        } else {
            var e = document.createEventObject();
            el.fireEvent('on' + type, e);
        }
    }

    function setupRupiahInput(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            // Format awal saat load
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
                
                // Trigger perhitungan lain yang bergantung pada input ini
                calculateDSR(); 
                updateBlokirOtomatis(); 
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
        // Handle input berupa elemen atau angka langsung
        const nilai = (typeof inputElement === 'object') ? (parseFloat(inputElement.value) || 0) : inputElement;
        
        if (nilai === 0) {
            outputElement.value = 'Nol';
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
        hitungBiaya(); 
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

        // Deteksi sumber penghasilan
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

        // --- [NEW] VISUAL WARNING JIKA DSR > 90% ---
        const alertId = 'dsr-warning-alert';
        let alertEl = document.getElementById(alertId);

        if (dsr > 90) {
            // Ubah warna input jadi merah
            dsrPemohonInput.style.color = 'red';
            dsrPemohonInput.style.fontWeight = 'bold';
            dsrPemohonInput.classList.add('is-invalid'); // Class error Bootstrap

            // Tampilkan Alert di bawah input
            if (!alertEl) {
                alertEl = document.createElement('div');
                alertEl.id = alertId;
                alertEl.className = 'alert alert-danger mt-2 py-1 px-2 small shadow-sm';
                alertEl.innerHTML = '<i class="bx bx-error me-1"></i><strong>PERINGATAN:</strong> DSR Melebihi 90%!';
                if (dsrPemohonInput.parentNode) {
                    dsrPemohonInput.parentNode.appendChild(alertEl);
                }
            } else {
                alertEl.style.display = 'block';
            }
        } else {
            // Kembalikan ke normal
            dsrPemohonInput.style.color = '';
            dsrPemohonInput.style.fontWeight = '';
            dsrPemohonInput.classList.remove('is-invalid');
            if (alertEl) alertEl.style.display = 'none';
        }
    }

    // ==========================================
    // 4. OTOMATISASI BLOKIR (NEW FEATURE)
    // ==========================================
    function updateBlokirOtomatis() {
        // A. Hitung Blokir Prapurna (Berdasarkan Tgl Input s.d Tgl BUP)
        // Hanya jalan jika field Tgl Pensiun (BUP) ada (biasanya di Form Prapurna)
        const tglBUPInput = document.getElementById('tgl_pensiun_pemohon'); 
        const blokirPrapurnaInput = document.getElementById('blokir_angsuran_prapurna');
        const blokirPrapurnaTerbilang = document.getElementById('blokir_angsuran_prapurna_terbilang');

        if (tglBUPInput && blokirPrapurnaInput && tglBUPInput.value) {
            const today = new Date();
            const bupDate = new Date(tglBUPInput.value);

            if (bupDate > today) {
                // Hitung selisih bulan penuh
                let years = bupDate.getFullYear() - today.getFullYear();
                let months = bupDate.getMonth() - today.getMonth();
                let totalMonths = (years * 12) + months;
                
                // Koreksi/Pembulatan (Contoh: 1 thn 9 bln 6 hari = 22 bln)
                // Rumus years*12 + months sudah mengembalikan bulan penuh.
                // Jika tanggal hari ini > tanggal BUP (misal tgl 26 vs tgl 1), bulan terakhir belum penuh.
                // Namun biasanya user ingin hitungan "masuk bulan ke-X", jadi kita tidak kurangi.
                // Jika negatif, set 0.
                if (totalMonths < 0) totalMonths = 0;
                
                blokirPrapurnaInput.value = totalMonths;
                if(blokirPrapurnaTerbilang) updateTerbilang(totalMonths, blokirPrapurnaTerbilang);
            } else {
                blokirPrapurnaInput.value = 0;
                if(blokirPrapurnaTerbilang) updateTerbilang(0, blokirPrapurnaTerbilang);
            }
        }

        // B. Hitung Total Blokir (Penjumlahan Prapurna + Pindah Gaji + Wajib)
        const elPrapurna = document.getElementById('blokir_angsuran_prapurna');
        const elPindah = document.getElementById('blokir_angsuran_pindah_gaji');
        const elWajib = document.getElementById('blokir_angsuran_lunas');
        
        const elTotal = document.getElementById('blokir_angsuran_total');
        const elTotalTerbilang = document.getElementById('blokir_angsuran_total_terbilang');

        if (elTotal) {
            const valPrapurna = elPrapurna ? (parseInt(elPrapurna.value) || 0) : 0;
            const valPindah = elPindah ? (parseInt(elPindah.value) || 0) : 0;
            const valWajib = elWajib ? (parseInt(elWajib.value) || 0) : 0;

            const total = valPrapurna + valPindah + valWajib;
            
            elTotal.value = total;
            if(elTotalTerbilang) updateTerbilang(total, elTotalTerbilang);
        }
    }

    // ==========================================
    // 5. TOGGLE HANDLERS (UI LOGIC)
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
            inputs.forEach(input => {
                if (!input.classList.contains('disabled-default')) {
                    input.disabled = false;
                }
            });
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
        const checkbox = (checkboxOrEvent.target) ? checkboxOrEvent.target : checkboxOrEvent;
        if(!checkbox) return;
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

        let selectedValue = 'baru';
        radioJenisPengajuan.forEach(radio => {
            if (radio.checked) selectedValue = radio.value;
        });

        if (selectedValue === 'baru' || selectedValue === 'takeover') {
            containerTopUp.style.display = 'none';
            if(inputRekening) inputRekening.disabled = true;
            if(inputPK) inputPK.disabled = true;
        
        } else if (selectedValue === 'top_up') {
            containerTopUp.style.display = 'block';
            if(inputRekening) inputRekening.disabled = false;
            
            if(containerPK) containerPK.style.display = 'none';
            if(inputPK) inputPK.disabled = true;

        } else if (selectedValue === 'top_up_sisa_gaji') {
            containerTopUp.style.display = 'block';
            if(containerPK) containerPK.style.display = 'block';
            
            if(inputRekening) inputRekening.disabled = false;
            if(inputPK) inputPK.disabled = false;
        }
    }

    radioJenisPengajuan.forEach(radio => {
        radio.addEventListener('change', handleJenisPengajuanChange);
    });

    // ==========================================
    // 6. SEGMENTASI (TASPEN/ASABRI)
    // ==========================================
    const segRadios = document.querySelectorAll('input[name="segmentasi"]');
    
    function updateLabelsBySegment() {
        let segmentasi = 'taspen';
        segRadios.forEach(r => { if(r.checked) segmentasi = r.value; });

        const isAsabri = (segmentasi === 'asabri');

        const setLabel = (id, textAsabri, textTaspen) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = isAsabri ? textAsabri : textTaspen;
        };

        setLabel('nip_pemohon', 'NRP Pemohon', 'NIP Pemohon');
        setLabel('no_sk_cpns', 'No. SKEP Pengangkatan Pertama', 'No. SK CPNS');
        setLabel('tgl_sk_cpns', 'Tgl SKEP Pengangkatan Pertama', 'Tgl SK CPNS');
        setLabel('no_sk_golongan', 'No. SKEP Pangkat Terakhir', 'No. SK Golongan');
        setLabel('tgl_sk_golongan', 'Tgl SKEP Pangkat Terakhir', 'Tgl SK Golongan');
        setLabel('jenis_pekerjaan_pemohon', 'Kesatuan/Instansi', 'Jenis Pekerjaan'); 
        
        if (document.getElementById('no_sk_pensiun')) {
             setLabel('jenis_pekerjaan_pemohon', 'Pensiunan Anggota (TNI/POLRI)', 'Jenis Pekerjaan (Pensiunan)');
             setLabel('no_sk_pensiun', 'No. SKEP Pensiun', 'No. SK Pensiun');
             setLabel('tgl_sk_pensiun', 'Tgl SKEP Pensiun', 'Tgl. SK Pensiun');
        }

        setLabel('golongan_saat_ini', 'Pangkat Saat Ini', 'Golongan Saat Ini');
    }

    // ==========================================
    // 7. INITIALIZATION & EVENTS (ON LOAD)
    // ==========================================
    
    // Setup Rupiah
    const nominalIDs = [
        'plafon_kredit_dimohon', 'usulan_plafon_kredit', 'usulan_angsuran',
        'gaji_bulan_1_jumlah', 'gaji_bulan_2_jumlah', 'gaji_bulan_3_jumlah',
        'pensiun_bulan_1_jumlah', 'pensiun_bulan_2_jumlah', 'pensiun_bulan_3_jumlah', 'pensiun_bulan_jumlah',
        'estimasi_hak_pensiun', 'taspen_tht', 'taspen_hak_pensiun',
        'biaya_provisi_nominal', 'biaya_tata_laksana_nominal', 'biaya_administrasi', 'info_gaji_bendahara'
    ];
    for(let i=1; i<=15; i++) {
        nominalIDs.push(`slik_bank_${i}_maks`, `slik_bank_${i}_outs`, `slik_bank_${i}_angsuran`);
    }
    nominalIDs.forEach(setupRupiahInput);

    // Setup Terbilang Manual & Trigger Update Blokir Total
    // (Pasang listener pada input blokir manual untuk mengupdate total otomatis)
    const pairs = [
        { in: 'blokir_angsuran_pindah_gaji', out: 'blokir_angsuran_pindah_gaji_terbilang' },
        { in: 'blokir_angsuran_lunas', out: 'blokir_angsuran_lunas_terbilang' },
        // Prapurna: pasang listener juga jika user edit manual
        { in: 'blokir_angsuran_prapurna', out: 'blokir_angsuran_prapurna_terbilang' } 
    ];
    pairs.forEach(p => {
        const elIn = document.getElementById(p.in);
        const elOut = document.getElementById(p.out);
        if(elIn && elOut) {
            updateTerbilang(elIn, elOut); 
            elIn.addEventListener('input', () => {
                updateTerbilang(elIn, elOut);
                updateBlokirOtomatis(); // Trigger total calc
            });
        }
    });

    // Observer untuk Prapurna (karena bisa berubah otomatis oleh date change)
    const prapurnaInput = document.getElementById('blokir_angsuran_prapurna');
    if(prapurnaInput) {
        const observer = new MutationObserver(updateBlokirOtomatis);
        observer.observe(prapurnaInput, { attributes: true, childList: false, characterData: false });
    }

    // Event Listeners
    if (tglLahirInput) tglLahirInput.addEventListener('change', hitungUsia);
    if (tglMulaiKerjaInput) tglMulaiKerjaInput.addEventListener('change', hitungLamaKerja);
    if (provisiPersenInput) provisiPersenInput.addEventListener('input', hitungBiaya);
    if (tataLaksanaPersenInput) tataLaksanaPersenInput.addEventListener('input', hitungBiaya);
    if (plafonDimohonInput) plafonDimohonInput.addEventListener('input', syncPengajuanKeUsulan);
    if (jangkaWaktuDimohonInput) jangkaWaktuDimohonInput.addEventListener('input', syncPengajuanKeUsulan);
    if (bungaUsulanInput) bungaUsulanInput.addEventListener('input', calculateNewPMT);
    
    // Event khusus Tgl Pensiun untuk Auto Blokir
    const tglBUPInput = document.getElementById('tgl_pensiun_pemohon');
    if(tglBUPInput) {
        tglBUPInput.addEventListener('change', updateBlokirOtomatis);
    }

    ['estimasi_hak_pensiun', 'pensiun_bulan_3_jumlah', 'pensiun_bulan_jumlah'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', calculateDSR);
    });
    for(let i=1; i<=15; i++){
        const el = document.getElementById(`slik_bank_${i}_angsuran`);
        if(el) el.addEventListener('input', calculateDSR);
    }

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

    // Dynamic Buttons (SLIK)
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
            let anyHidden = false;
            for (let i = 2; i <= 15; i++) {
                const row = document.getElementById('slik-facility-' + i);
                if (row && getComputedStyle(row).display === 'none') anyHidden = true;
            }
            if (!anyHidden) addSlikButton.style.display = 'none';
        });
    }

    // Dynamic Buttons (Syarat)
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

    // Delete Buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('slik-delete-btn')) {
            const id = e.target.dataset.facilityId;
            const row = document.getElementById('slik-facility-' + id);
            if (row) {
                row.style.display = 'none';
                row.querySelectorAll('input, textarea').forEach(input => {
                    input.value = '';
                    if(input.type === 'checkbox' || input.type === 'radio') input.checked = false;
                });
                if(addSlikButton) addSlikButton.style.display = 'block';
                calculateDSR();
            }
        }
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

    // =======================================================================
    // PREVIEW MODAL & SUBMIT HANDLER (WITH DSR HARD BLOCK CHECK)
    // =======================================================================
    const mainForm = document.getElementById('mainForm');
    const previewModal = document.getElementById('previewModal');
    let bsModal = null;
    if(previewModal && typeof bootstrap !== 'undefined') {
        bsModal = new bootstrap.Modal(previewModal);
    }

    if (mainForm && bsModal) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 1. CEK VALIDITAS HTML
            if (!mainForm.checkValidity()) {
                mainForm.reportValidity();
                return;
            }

            // 2. [NEW] CEK VALIDITAS DSR (HARD BLOCK)
            // Jika DSR > 90%, Stop! Tampilkan Alert dan Jangan Buka Modal
            const dsrVal = parseFloat(document.getElementById('dsr_pemohon').value) || 0;
            if (dsrVal > 90) {
                alert("GAGAL MENYIMPAN:\n\nDSR (Debt Service Ratio) saat ini " + dsrVal.toFixed(2) + "%.\nBatas maksimal adalah 90%.\n\nMohon kurangi plafon kredit, perpanjang jangka waktu, atau lakukan pelunasan angsuran eksisting.");
                
                // Scroll user ke field DSR agar mereka sadar
                const dsrInput = document.getElementById('dsr_pemohon');
                if(dsrInput) {
                    dsrInput.scrollIntoView({behavior: "smooth", block: "center"});
                    dsrInput.focus();
                }
                return; // STOP DI SINI
            }

            // 3. JIKA AMAN, POPULATE PREVIEW
            mainForm.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="tel"], textarea, select').forEach(input => {
               const previewId = 'preview_' + input.id;
               const previewEl = document.getElementById(previewId);
               if(previewEl) previewEl.textContent = input.value;
            });

            mainForm.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                const previewId = 'preview_' + chk.id;
                const previewEl = document.getElementById(previewId);
                if(previewEl && chk.id.includes('_takeover')) {
                    previewEl.textContent = chk.checked ? ' (Take Over)' : '';
                }
            });

            const seg = document.querySelector('input[name="segmentasi"]:checked');
            const prevSeg = document.getElementById('preview_segmentasi');
            if(seg && prevSeg) {
                prevSeg.textContent = seg.value === 'asabri' ? 'ASABRI (TNI/POLRI)' : 'TASPEN (PNS)';
                prevSeg.className = seg.value === 'asabri' ? 'badge bg-success' : 'badge bg-primary';
            }

            const jenisPengajuan = document.querySelector('input[name="jenis_pengajuan"]:checked');
            const previewJenis = document.getElementById('preview_jenis_pengajuan');
            const rowRekening = document.getElementById('preview-row-rekening');
            const rowPK = document.getElementById('preview-row-pk');
            const valRekening = document.getElementById('no_rekening_pinjaman');
            const valPK = document.getElementById('no_pk_eksisting');
            const prevRekening = document.getElementById('preview_no_rekening_pinjaman');
            const prevPK = document.getElementById('preview_no_pk_eksisting');

            if(rowRekening) rowRekening.style.display = 'none';
            if(rowPK) rowPK.style.display = 'none';

            if (previewJenis) {
                if (jenisPengajuan) {
                    let label = "Baru";
                    if (jenisPengajuan.value === 'top_up') {
                        label = "Suplesi / Top Up";
                        if(rowRekening) rowRekening.style.display = 'flex';
                        if(prevRekening && valRekening) prevRekening.textContent = valRekening.value;
                    } else if (jenisPengajuan.value === 'top_up_sisa_gaji') {
                        label = "Top Up Sisa Gaji";
                        if(rowRekening) rowRekening.style.display = 'flex';
                        if(prevRekening && valRekening) prevRekening.textContent = valRekening.value;
                        if(rowPK) rowPK.style.display = 'flex';
                        if(prevPK && valPK) prevPK.textContent = valPK.value;
                    } else if (jenisPengajuan.value === 'takeover') {
                        label = "Take Over (Pindah Bank)";
                    }
                    previewJenis.textContent = label;
                } else {
                    previewJenis.textContent = "-";
                }
            }

            // Generate SLIK Preview (Termasuk Badge Baru)
            const slikContainer = document.getElementById('preview-slik-container');
            const toggleNihil = document.getElementById('toggle-fasilitas-nihil');
            const nihilPreview = document.getElementById('preview-fasilitas-nihil');
            
            if (slikContainer) {
                slikContainer.innerHTML = '';
                
                if (toggleNihil && toggleNihil.checked) {
                    if(nihilPreview) nihilPreview.style.display = 'block';
                    slikContainer.style.display = 'none';
                } else {
                    if(nihilPreview) nihilPreview.style.display = 'none';
                    slikContainer.style.display = 'block';

                    let hasData = false;
                    for (let i = 1; i <= 15; i++) {
                        const facilityRow = document.getElementById('slik-facility-' + i);
                        const namaBank = document.getElementById('slik_bank_' + i + '_nama');
                        
                        if (facilityRow && (getComputedStyle(facilityRow).display !== 'none' || (namaBank && namaBank.value))) {
                            const jenis = document.getElementById('slik_bank_' + i + '_jenis').value || '-';
                            const bank = document.getElementById('slik_bank_' + i + '_nama').value || '-';
                            const plafon = document.getElementById('slik_bank_' + i + '_maks').value || '0';
                            const outs = document.getElementById('slik_bank_' + i + '_outs').value || '0';
                            const kol = document.getElementById('slik_bank_' + i + '_coll').value || '-';
                            const angsuran = document.getElementById('slik_bank_' + i + '_angsuran').value || '0';
                            
                            // Logic Badge TakeOver
                            const toCheck = document.getElementById('slik_bank_' + i + '_takeover');
                            const isTakeover = toCheck && toCheck.checked ? '<span class="badge bg-label-danger ms-2">Take Over</span>' : '';

                            // Logic Badge Pelunasan Top Up (NEW)
                            const topUpCheck = document.getElementById('slik_bank_' + i + '_topup_lunas');
                            const isTopUpLunas = topUpCheck && topUpCheck.checked ? '<span class="badge bg-label-warning ms-2">Pelunasan Top Up</span>' : '';

                            const html = `
                                <div class="mb-3 pb-3 border-bottom">
                                    <div class="row mb-1">
                                        <div class="col-md-12 fw-bold text-primary d-flex align-items-center">
                                            Fasilitas Aktif ${i} ${isTakeover} ${isTopUpLunas}
                                        </div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-4 fw-semibold">Bank / Jenis:</div>
                                        <div class="col-md-8">${bank} / ${jenis}</div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-4 fw-semibold">Plafon / O.S:</div>
                                        <div class="col-md-8">Rp ${plafon} / Rp ${outs}</div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-4 fw-semibold">Kolektibilitas:</div>
                                        <div class="col-md-8">${kol}</div>
                                    </div>
                                    <div class="row mb-1">
                                        <div class="col-md-4 fw-bold text-dark">Angsuran:</div>
                                        <div class="col-md-8 fw-bold text-dark">Rp ${angsuran}</div>
                                    </div>
                                </div>
                            `;
                            slikContainer.insertAdjacentHTML('beforeend', html);
                            hasData = true;
                        }
                    }
                    
                    if (!hasData) {
                        slikContainer.innerHTML = '<div class="text-muted fst-italic">Belum ada data fasilitas yang diinput.</div>';
                    }
                }
            }

            // Syarat Kustom Preview
            const listPenandatanganan = document.getElementById('preview-list-penandatanganan');
            const listPencairan = document.getElementById('preview-list-pencairan');
            
            if(listPenandatanganan) listPenandatanganan.innerHTML = '';
            if(listPencairan) listPencairan.innerHTML = '';
            
            for (let i = 1; i <= 10; i++) {
                const teksEl = document.getElementById(`syarat_kustom_${i}_teks`);
                if (teksEl && teksEl.value) { 
                    const teks = teksEl.value;
                    const lokasi = document.querySelector(`input[name="syarat_kustom_${i}_lokasi"]:checked`);
                    if (lokasi && lokasi.value === 'penandatanganan' && listPenandatanganan) {
                        const li = document.createElement('li');
                        li.textContent = teks;
                        listPenandatanganan.appendChild(li);
                    } else if (lokasi && lokasi.value === 'pencairan' && listPencairan) {
                        const li = document.createElement('li');
                        li.textContent = teks;
                        listPencairan.appendChild(li);
                    }
                }
            }

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

    // Run initial logic
    hitungUsia();
    hitungLamaKerja();
    syncPengajuanKeUsulan(); 
    updateLabelsBySegment();
    handleNihilToggle();
    handleMitigasiToggle();
    handleDomisiliToggle();
    handleBebasAdminToggle();
    handleJenisPengajuanChange();
    document.querySelectorAll('.toggle-alasan').forEach(handleAlasanToggle);
    calculateDSR();
    updateBlokirOtomatis(); 

});