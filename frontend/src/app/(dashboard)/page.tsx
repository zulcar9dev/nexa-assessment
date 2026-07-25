import Link from "next/link";
import { Briefcase, UserCheck, Zap } from "lucide-react";

// Product category data matching the Flask app
const productCategories = [
    {
        key: "type_c",
        nama: "Assessment Type C (Active)",
        description: "Assessment untuk karyawan aktif (Payroll Nexa)",
        icon: Zap,
        href: "/form/type-c",
        color: "from-[#1976d2] to-[#0d47a1]",
    },
    {
        key: "type_a_reguler",
        nama: "Assessment Type A (Pre-Period)",
        description: "Assessment pra-periode untuk transisi pekerja",
        icon: Briefcase,
        href: "/form/type-a",
        color: "from-brand to-brand-dark",
    },
    {
        key: "type_b_reguler",
        nama: "Assessment Type B (Full-Period)",
        description: "Assessment purna-periode untuk pensiunan",
        icon: UserCheck,
        href: "/form/type-b",
        color: "from-[#0f172a] to-[#0891b2]",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="card card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-brand dark:text-[#a5b4fc] mb-2">
                            Halo, Selamat Datang! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Siap memproses assessment hari ini? Pilih jenis assessment di bawah untuk memulai.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-32 h-32 bg-gradient-to-br from-[#eef2ff] to-[#c7d2fe] dark:from-brand/30 dark:to-brand-dark/30 rounded-full flex items-center justify-center">
                            <svg
                                className="w-20 h-20 text-brand dark:text-[#a5b4fc]"
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
                            <div className="mx-auto w-20 h-20 mb-4 bg-[#eef2ff] dark:bg-brand/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <product.icon className="w-10 h-10 text-brand dark:text-[#a5b4fc]" />
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
                  border-2 border-[#0f172a] text-accent 
                  rounded-full font-medium text-sm
                  hover:bg-accent hover:text-white
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
