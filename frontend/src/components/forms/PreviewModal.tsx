"use client";

import { useUIStore } from "@/stores/ui-store";
import { useFormStore } from "@/stores/form-store";
import { formatRupiah } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/**
 * Main Preview Modal Component
 */
export default function PreviewModal() {
    const { isPreviewModalOpen, closePreviewModal } = useUIStore();
    const { formData, dsrResult } = useFormStore();

    return (
        <Dialog open={isPreviewModalOpen} onOpenChange={(open) => !open && closePreviewModal()}>
            <DialogContent className="max-w-4xl h-[90vh] sm:h-auto max-h-[90vh] flex flex-col overflow-hidden p-0 bg-white dark:bg-[#1a2c2a] border-gray-200 dark:border-gray-700">
                {/* Header */}
                <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2c2a] flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-xl font-bold text-primary-brand dark:text-[#a5b4fc]">
                        Preview Data Pengajuan
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-[#152322]">

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
                            <div className="bg-[#f0f9f8] dark:bg-[#0f2322] p-4 rounded-lg shadow-sm border border-[#cdeae7] dark:border-[#1a2c2a]">
                                <h3 className="text-lg font-bold text-primary-brand dark:text-[#a5b4fc] mb-4 pb-2 border-b border-[#cdeae7] dark:border-[#2d4a48] flex items-center gap-2">
                                    <span className="w-1 h-5 bg-primary-brand rounded-full"></span>
                                    Capacity Analysis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    <PreviewItem label="Total Penghasilan (Net)" value={`Rp ${formatRupiah(dsrResult.penghasilan)}`} />
                                    <PreviewItem label="Maksimal Payment (90%)" value={`Rp ${formatRupiah(dsrResult.maksimalAngsuran)}`} />
                                    <PreviewItem label="Total Payment Baru" value={`Rp ${formatRupiah(dsrResult.totalAngsuranBaru)}`} />
                                    <PreviewItem
                                        label="Ratio DSR"
                                        value={`${dsrResult.dsr.toFixed(2)}%`}
                                        className={dsrResult.isValid ? "text-green-600 dark:text-green-400 font-bold text-lg" : "text-red-500 dark:text-red-400 font-bold text-lg"}
                                    />
                                </div>
                                <div className={`mt-4 p-3 rounded-lg text-center font-bold text-sm ${dsrResult.isValid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    {dsrResult.isValid ? "DSR MASUK / LAYAK" : "DSR TIDAK MASUK / TIDAK LAYAK"}
                                </div>
                            </div>
                        )
                    }

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2c2a] flex justify-end">
                    <button
                        onClick={closePreviewModal}
                        className="px-6 py-2.5 bg-primary-brand text-white rounded-lg hover:bg-[#00554e] transition-colors font-bold shadow-lg shadow-[#4f46e5]/20 cursor-pointer"
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
        <section className="bg-white dark:bg-[#1a2c2a] p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-[#0c1d1b] dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-brand rounded-full"></span>
                {title}
            </h3>
            {children}
        </section>
    );
}

function PreviewItem({ label, value, fullWidth = false, className = "" }: { label: string, value: string | undefined | number, fullWidth?: boolean, className?: string }) {
    return (
        <div className={`${fullWidth ? "col-span-1 md:col-span-2" : ""}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
            <p className={`font-semibold text-[#0c1d1b] dark:text-gray-200 ${className}`}>{value || "-"}</p>
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
