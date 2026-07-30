"use client";

import { useUIStore } from "@/stores/ui-store";
import { useFormStore } from "@/stores/form-store";
import { formatRupiah } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

/**
 * Main Preview Modal Component
 */
export default function PreviewModal() {
    const { isPreviewModalOpen, closePreviewModal } = useUIStore();
    const { formData, dsrResult } = useFormStore();

    return (
        <Dialog open={isPreviewModalOpen} onOpenChange={closePreviewModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-outline-variant/30 shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 border-b border-outline-variant/30 sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Validasi & Tinjau Data</h2>
                        <p className="text-on-surface-variant mt-1 font-body-base">Pastikan semua rincian payroll sudah sesuai sebelum dikirim untuk proses selanjutnya.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* Identitas */}
                    <PreviewSection title="Data Identitas">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <PreviewItem label="Nama Pemohon" value={formData.nama_pemohon} />
                            <PreviewItem label="No. KTP" value={formData.no_ktp_pemohon} />
                            <PreviewItem label="Tgl Lahir" value={formData.tgl_lahir_pemohon} />
                            <PreviewItem label="No. Telepon" value={formData.no_telepon} />
                            <PreviewItem label="Status Perkawinan" value={formData.status_perkawinan} />
                            {formData.tempat_tinggal_berbeda ? (
                                <>
                                    <PreviewItem label="Alamat KTP" value={formData.alamat_ktp} />
                                    <PreviewItem label="Alamat Tempat Tinggal" value={formData.alamat_tempat_tinggal} fullWidth />
                                </>
                            ) : (
                                <PreviewItem label="Alamat KTP & Domisili" value={formData.alamat_ktp} fullWidth />
                            )}
                        </div>
                    </PreviewSection>

                    {/* Pekerjaan */}
                    <PreviewSection title="Data Pekerjaan / Pensiun">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <PreviewItem label="Instansi" value={formData.instansi} />
                            <PreviewItem label="Golongan" value={formData.golongan} />
                            <PreviewItem label="NIP" value={formData.nip} />
                            <PreviewItem label="No. SK Pensiun" value={formData.no_sk_pensiun} />
                        </div>
                    </PreviewSection>

                    {/* Penghasilan */}
                    <PreviewSection title="Data Penghasilan">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <PreviewItem label="Sumber Pembayaran" value={formData.nama_bank_pembayaran} />
                            <PreviewItem
                                label="Rata-rata Penghasilan"
                                value={`Rp ${formatRupiah(
                                    formData.estimasi_hak_pensiun ||
                                    formData.pensiun_bulan_jumlah ||
                                    formData.gaji_bulan_1_jumlah ||
                                    dsrResult?.penghasilan ||
                                    0
                                )}`}
                            />
                            {/* Show breakdown if available */}
                            {(formData.gaji_bulan_1_jumlah || formData.pensiun_bulan_1_jumlah) && (
                                <>
                                    <PreviewItem
                                        label={formData.gaji_bulan_1_jumlah ? "Gaji Bulan 1" : "Pensiun Bulan 1"}
                                        value={`Rp ${formatRupiah(formData.gaji_bulan_1_jumlah || formData.pensiun_bulan_1_jumlah || 0)}`}
                                    />
                                    <PreviewItem
                                        label={formData.gaji_bulan_2_jumlah ? "Gaji Bulan 2" : "Pensiun Bulan 2"}
                                        value={`Rp ${formatRupiah(formData.gaji_bulan_2_jumlah || formData.pensiun_bulan_2_jumlah || 0)}`}
                                    />
                                    <PreviewItem
                                        label={formData.gaji_bulan_3_jumlah ? "Gaji Bulan 3" : "Pensiun Bulan 3"}
                                        value={`Rp ${formatRupiah(formData.gaji_bulan_3_jumlah || formData.pensiun_bulan_3_jumlah || 0)}`}
                                    />
                                </>
                            )}
                            {formData.estimasi_hak_pensiun && (
                                <PreviewItem label="Estimasi Hak Pensiun" value={`Rp ${formatRupiah(formData.estimasi_hak_pensiun)}`} className="font-bold text-primary-brand" />
                            )}
                            {formData.ung_kategori_pegawai === "non_dosen" && (
                                <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">
                                        Rincian Tunjangan/Remunerasi UNG (PNS Non-Dosen)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f8fcfc] dark:bg-[#132b29] p-3 rounded-lg border border-[#cdeae7] dark:border-opacity-25">
                                        <PreviewItem
                                            label="Remun 30% (Bulanan)"
                                            value={`Rp ${formatRupiah(formData.ung_remunerasi_30_bulanan || 0)}`}
                                        />
                                        <PreviewItem
                                            label="Remun 70% (Semesteran)"
                                            value={`Rp ${formatRupiah(formData.ung_remunerasi_70_semesteran || 0)}`}
                                        />
                                        <PreviewItem
                                            label="Remun Diakui per Bulan"
                                            value={`Rp ${formatRupiah(
                                                (parseFloat(formData.ung_remunerasi_30_bulanan || "0") || 0) +
                                                Math.round((parseFloat(formData.ung_remunerasi_70_semesteran || "0") || 0) / 6)
                                            )}`}
                                            className="text-primary-brand dark:text-[#a5b4fc] font-bold"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </PreviewSection>

                    {/* Data Eksternal */}
                    <PreviewSection title="Data Eksternal">
                        {formData.fasilitas_nihil === "ya" ? (
                            <SLIKStatus status="NIHIL" />
                        ) : (
                            <>
                                {formData.slik_facilities && formData.slik_facilities.length > 0 ? (
                                    <SLIKTable facilities={formData.slik_facilities} totalAngsuran={dsrResult?.totalAngsuranEksisting || 0} />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                        <PreviewItem label="Status Data Eksternal" value="Belum ada data fasilitas" />
                                        <PreviewItem label="Total Payment Eksisting" value={`Rp ${formatRupiah(dsrResult?.totalAngsuranEksisting || 0)}`} />
                                    </div>
                                )}
                            </>
                        )}
                    </PreviewSection>

                    {/* Usulan */}
                    <PreviewSection title="Proposal Assessment">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <PreviewItem label="Segmentasi" value={formData.segmentasi} />
                            <PreviewItem label="Jenis Pengajuan" value={formData.jenis_pengajuan} />
                            <PreviewItem label="Budget Allocation" value={`Rp ${formatRupiah(formData.usulan_plafon_kredit || 0)}`} />
                            <PreviewItem label="Jangka Waktu" value={`${formData.usulan_jangka_waktu_bulan || 0} Bulan`} />
                            <PreviewItem label="Rate" value={`${formData.usulan_bunga_persen || 0}%`} />
                        </div>
                    </PreviewSection>

                    {/* DSR Result */}
                    {
                        dsrResult && (
                            <div className="bg-primary text-white rounded-2xl shadow-xl p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                                <p className="text-white/70 text-label-caps mb-2 uppercase tracking-widest">Capacity Analysis</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-label-sm">Total Penghasilan (Net)</p>
                                        <p className="font-body-base font-semibold">Rp {formatRupiah(dsrResult.penghasilan)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-label-sm">Maksimal Payment (90%)</p>
                                        <p className="font-body-base font-semibold">Rp {formatRupiah(dsrResult.maksimalAngsuran)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-label-sm">Total Payment Baru</p>
                                        <p className="font-body-base font-semibold">Rp {formatRupiah(dsrResult.totalAngsuranBaru)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-label-sm">Ratio DSR</p>
                                        <p className="text-headline-md font-bold">{dsrResult.dsr.toFixed(2)}%</p>
                                    </div>
                                </div>
                                <div className={`mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-body-base relative z-10`}>
                                    <span className="opacity-70">Status kelayakan:</span>
                                    <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${dsrResult.isValid ? 'bg-success/20 text-white' : 'bg-danger/20 text-white'}`}>
                                        {dsrResult.isValid ? "DSR MASUK / LAYAK" : "DSR TIDAK MASUK / TIDAK LAYAK"}
                                    </span>
                                </div>
                            </div>
                        )
                    }

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/30 bg-surface-light dark:bg-surface-dark flex justify-end">
                    <button
                        onClick={closePreviewModal}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-container transition-colors font-title-sm text-title-sm shadow-sm cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Sub Components ---

function PreviewSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="bg-surface-container-low dark:bg-surface-container/20 p-6 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <h3 className="font-title-sm text-title-sm text-on-surface">
                    {title}
                </h3>
            </div>
            {children}
        </section>
    );
}

function PreviewItem({ label, value, fullWidth = false, className = "" }: { label: string, value: string | undefined | number, fullWidth?: boolean, className?: string }) {
    return (
        <div className={`${fullWidth ? "col-span-1 md:col-span-2" : ""} space-y-1`}>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
            <p className={`font-body-base font-semibold text-on-surface ${className}`}>{value || "-"}</p>
        </div>
    );
}

function SLIKStatus({ status }: { status: "NIHIL" | string }) {
    return (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="font-medium text-green-600 dark:text-green-400">✓ Fasilitas {status}</p>
            <p className="text-sm mt-1">Tidak ada pinjaman eksisting</p>
        </div>
    );
}

function SLIKTable({ facilities, totalAngsuran }: { facilities: { nama_bank: string; plafon_maks: string; outstanding: string; angsuran: string; kolektibilitas: string }[], totalAngsuran: number }) {
    return (
        <div className="space-y-3">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-2 text-xs text-gray-500 uppercase">Institusi</th>
                            <th className="text-right py-2 px-2 text-xs text-gray-500 uppercase">Plafon</th>
                            <th className="text-right py-2 px-2 text-xs text-gray-500 uppercase">Outstanding</th>
                            <th className="text-right py-2 px-2 text-xs text-gray-500 uppercase">Payment Schedule</th>
                            <th className="text-center py-2 px-2 text-xs text-gray-500 uppercase">Kol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facilities.map((facility, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 px-2 font-medium">{facility.nama_bank || "-"}</td>
                                <td className="py-2 px-2 text-right">{`Rp ${formatRupiah(facility.plafon_maks)}`}</td>
                                <td className="py-2 px-2 text-right">{`Rp ${formatRupiah(facility.outstanding)}`}</td>
                                <td className="py-2 px-2 text-right font-semibold text-primary-brand dark:text-[#a5b4fc]">
                                    {`Rp ${formatRupiah(facility.angsuran)}`}
                                </td>
                                <td className="py-2 px-2 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${facility.kolektibilitas === "1" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                                        facility.kolektibilitas === "2" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        }`}>
                                        {facility.kolektibilitas || "-"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 dark:bg-[#0f2322] font-bold">
                            <td colSpan={3} className="py-2 px-2 text-right">Total Payment Eksisting:</td>
                            <td className="py-2 px-2 text-right text-primary-brand dark:text-[#a5b4fc]">
                                {`Rp ${formatRupiah(totalAngsuran)}`}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

// Helper removed (use formatRupiah)
