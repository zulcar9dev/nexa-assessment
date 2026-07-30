import Link from "next/link";
import { 
    CheckSquare, Clock, BarChart3, 
    Banknote, ArrowRightLeft, UserCheck, 
    ArrowRight, Info, MoreHorizontal, 
    CheckCircle, UserPlus, AlertTriangle,
    Award
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="max-w-[1440px] mx-auto min-h-screen">
            {/* Welcome Header */}
            <section className="mb-8">
                <div className="relative overflow-hidden p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--tertiary-container)] text-white shadow-lg">
                    <div className="relative z-10">
                        <h2 className="text-headline-lg font-heading font-bold mb-2">Halo, Selamat Datang! 👋</h2>
                        <p className="text-body-lg text-white/90 max-w-xl">
                            Anda memiliki 3 assessment yang sedang berjalan. Tingkatkan efisiensi pengelolaan tenaga kerja Anda dengan data yang akurat.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl shadow-sm border border-[var(--outline-variant)]/10 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-label-caps text-[var(--on-surface-variant)] uppercase">Selesai</p>
                        <p className="text-headline-md font-heading font-bold">12</p>
                    </div>
                </div>
                <div className="p-6 bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl shadow-sm border border-[var(--outline-variant)]/10 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-label-caps text-[var(--on-surface-variant)] uppercase">Berjalan</p>
                        <p className="text-headline-md font-heading font-bold">3</p>
                    </div>
                </div>
                <div className="p-6 bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl shadow-sm border border-[var(--outline-variant)]/10 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-label-caps text-[var(--on-surface-variant)] uppercase">Rata-rata Skor</p>
                        <p className="text-headline-md font-heading font-bold">88.4%</p>
                    </div>
                </div>
            </section>

            {/* Assessment Section */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-title-lg font-heading font-bold text-[var(--on-surface)]">Tipe Assessment Tersedia</h3>
                    <button className="text-primary font-heading font-semibold text-sm flex items-center gap-1 hover:underline">
                        Lihat Semua <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Active */}
                    <div className="assessment-card group bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl overflow-hidden shadow-sm border border-[var(--outline-variant)]/10 transition-all duration-300">
                        <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] p-6 flex justify-between items-start">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <Banknote className="w-7 h-7 text-white" />
                            </div>
                            <span className="px-2 py-1 bg-[var(--success)]/20 text-[var(--success)] text-[10px] font-bold uppercase rounded-full border border-[var(--success)]/30 backdrop-blur-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></span> Active
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-label-sm text-[var(--on-surface-variant)] mb-1">Assessment Type C</p>
                            <h4 className="text-title-sm font-heading font-semibold mb-4 text-[var(--on-surface)]">Payroll Nexa</h4>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-body-base">
                                    <span className="text-[var(--on-surface-variant)]">Progress</span>
                                    <span className="font-bold text-[var(--on-surface)]">75%</span>
                                </div>
                                <div className="w-full bg-[var(--surface-container)] h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-3/4 rounded-full"></div>
                                </div>
                            </div>
                            <Link href="/form/type-c" className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-heading font-semibold hover:bg-[var(--primary-container)] transition-colors shadow-sm flex items-center justify-center">
                                Mulai Assessment
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: Pre-Period */}
                    <div className="assessment-card group bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl overflow-hidden shadow-sm border border-[var(--outline-variant)]/10 transition-all duration-300">
                        <div className="h-32 bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-container)] p-6 flex justify-between items-start">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <ArrowRightLeft className="w-7 h-7 text-white" />
                            </div>
                            <span className="px-2 py-1 bg-[var(--warning)]/20 text-[var(--warning)] text-[10px] font-bold uppercase rounded-full border border-[var(--warning)]/30 backdrop-blur-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[var(--warning)] rounded-full"></span> Pre-Period
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-label-sm text-[var(--on-surface-variant)] mb-1">Assessment Type A</p>
                            <h4 className="text-title-sm font-heading font-semibold mb-4 text-[var(--on-surface)]">Transition Worker</h4>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-body-base">
                                    <span className="text-[var(--on-surface-variant)]">Estimasi Waktu</span>
                                    <span className="font-medium text-[var(--on-surface)]">45 Menit</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-label-sm text-[var(--on-surface-variant)]">
                                    <Info className="w-4 h-4" /> Tersedia mulai besok
                                </div>
                            </div>
                            <Link href="/form/type-a" className="w-full py-3 border-2 border-[var(--secondary)] text-[var(--secondary)] rounded-xl font-heading font-semibold hover:bg-[var(--secondary)]/10 transition-all flex items-center justify-center">
                                Lihat Detail
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Full-Period */}
                    <div className="assessment-card group bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl overflow-hidden shadow-sm border border-[var(--outline-variant)]/10 transition-all duration-300">
                        <div className="h-32 bg-gradient-to-r from-[var(--tertiary)] to-[var(--tertiary-container)] p-6 flex justify-between items-start">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <UserCheck className="w-7 h-7 text-white" />
                            </div>
                            <span className="px-2 py-1 bg-[var(--info)]/20 text-[var(--info)] text-[10px] font-bold uppercase rounded-full border border-[var(--info)]/30 backdrop-blur-sm">
                                Full-Period
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-label-sm text-[var(--on-surface-variant)] mb-1">Assessment Type B</p>
                            <h4 className="text-title-sm font-heading font-semibold mb-4 text-[var(--on-surface)]">Retiree Program</h4>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-body-base">
                                    <span className="text-[var(--on-surface-variant)]">Kapasitas</span>
                                    <span className="font-medium text-[var(--on-surface)]">120/150</span>
                                </div>
                                <div className="w-full bg-[var(--surface-container)] h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[var(--tertiary)] h-full w-[80%] rounded-full"></div>
                                </div>
                            </div>
                            <Link href="/form/type-b" className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-heading font-semibold hover:bg-[var(--primary-container)] transition-colors shadow-sm flex items-center justify-center">
                                Mulai Assessment
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Grid: Recent Activity & Promotion */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[var(--surface-light)] dark:bg-[var(--card)] rounded-xl shadow-sm border border-[var(--outline-variant)]/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-title-sm font-heading font-semibold text-[var(--on-surface)]">Aktivitas Terakhir</h3>
                        <button className="text-[var(--on-surface-variant)] hover:text-primary transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] shrink-0">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 border-b border-[var(--outline-variant)]/10 pb-4">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-heading font-semibold text-[14px] text-[var(--on-surface)]">Menyelesaikan 'Onboarding 2024'</p>
                                    <span className="text-label-sm text-[var(--on-surface-variant)]">2 jam yang lalu</span>
                                </div>
                                <p className="text-body-base text-[var(--on-surface-variant)] text-[13px]">User ID #88192 berhasil memvalidasi seluruh dokumen payroll.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--info)]/10 flex items-center justify-center text-[var(--info)] shrink-0">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="flex-1 border-b border-[var(--outline-variant)]/10 pb-4">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-heading font-semibold text-[14px] text-[var(--on-surface)]">Tim Baru Ditambahkan</p>
                                    <span className="text-label-sm text-[var(--on-surface-variant)]">5 jam yang lalu</span>
                                </div>
                                <p className="text-body-base text-[var(--on-surface-variant)] text-[13px]">Divisi Keuangan menambahkan 5 anggota baru untuk evaluasi kuartal.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)] shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-heading font-semibold text-[14px] text-[var(--on-surface)]">Deadline Mendekat</p>
                                    <span className="text-label-sm text-[var(--on-surface-variant)]">8 jam yang lalu</span>
                                </div>
                                <p className="text-body-base text-[var(--on-surface-variant)] text-[13px]">Assessment 'Retiree' akan berakhir dalam 48 jam ke depan.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Promotion Card */}
                <div className="bg-[var(--primary-container)] rounded-xl p-6 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 transition-transform duration-500 group-hover:scale-[1.8]">
                        <Award className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-title-lg font-heading font-bold mb-2">Upgrade ke Enterprise+</h4>
                        <p className="text-body-base opacity-90 mb-4">Dapatkan fitur analitik prediktif berbasis AI dan integrasi API tanpa batas.</p>
                        <ul className="space-y-2 mb-6 text-[13px]">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Real-time Monitoring</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Custom Branding</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> 24/7 Priority Support</li>
                        </ul>
                    </div>
                    <button className="relative z-10 w-full py-3 bg-white text-[var(--primary)] rounded-xl font-heading font-semibold hover:bg-[var(--surface-container-low)] transition-colors">
                        Pelajari Selengkapnya
                    </button>
                </div>
            </section>
        </div>
    );
}
