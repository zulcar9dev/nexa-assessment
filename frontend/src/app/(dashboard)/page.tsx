import Link from "next/link";
import { Briefcase, UserCheck, Zap } from "lucide-react";

// Product category data matching the Flask app
const productCategories = [
    {
        key: "aktif",
        nama: "BNI Fleksi Aktif",
        description: "Kredit untuk pegawai aktif (Payroll BNI)",
        icon: Zap,
        href: "/form/aktif",
        color: "from-[#1976d2] to-[#0d47a1]",
    },
    {
        key: "prapurna_reguler",
        nama: "BNI Fleksi Pensiun Prapurna",
        description: "Kredit untuk PNS yang akan memasuki masa pensiun",
        icon: Briefcase,
        href: "/form/prapurna",
        color: "from-[#00665e] to-[#004d47]",
    },
    {
        key: "purna_reguler",
        nama: "BNI Fleksi Pensiun Purna",
        description: "Kredit untuk pensiunan PNS/TNI/POLRI",
        icon: UserCheck,
        href: "/form/purna",
        color: "from-[#f15a23] to-[#d1400b]",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="card card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4] mb-2">
                            Halo, Selamat Datang! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Siap memproses pengajuan kredit hari ini? Pilih kategori produk di bawah untuk memulai.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-32 h-32 bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] dark:from-[#00665e]/30 dark:to-[#004d47]/30 rounded-full flex items-center justify-center">
                            <svg
                                className="w-20 h-20 text-[#00665e] dark:text-[#80cbc4]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {productCategories.map((product) => (
                    <div
                        key={product.key}
                        className="card card-hover overflow-hidden group"
                    >
                        {/* Gradient Header */}
                        <div className={`h-2 bg-gradient-to-r ${product.color}`} />

                        <div className="p-6 text-center">
                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 mb-4 bg-[#e0f2f1] dark:bg-[#00665e]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <product.icon className="w-10 h-10 text-[#00665e] dark:text-[#80cbc4]" />
                            </div>

                            {/* Title */}
                            <h3 className="card-title text-lg font-bold mb-2">
                                {product.nama}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                {product.description}
                            </p>

                            {/* Button */}
                            <Link
                                href={product.href}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 
                  border-2 border-[#f15a23] text-[#f15a23] 
                  rounded-full font-medium text-sm
                  hover:bg-[#f15a23] hover:text-white
                  transition-all duration-200
                  group-hover:shadow-lg"
                            >
                                Mulai Input
                            </Link>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
