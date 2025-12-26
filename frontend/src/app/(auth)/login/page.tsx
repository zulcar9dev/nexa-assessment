"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login - replace with actual auth logic
        setTimeout(() => {
            // Set auth cookie on successful login
            document.cookie = "auth-session=authenticated; path=/; max-age=86400";
            setIsLoading(false);
            window.location.href = "/";
        }, 1000);
    };

    return (
        <div className="flex min-h-full flex-1">
            {/* Left Side: Branding Panel */}
            <div className="relative hidden w-0 flex-1 lg:flex lg:flex-col">
                {/* Background Image */}
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
                    }}
                />
                {/* Gradient Overlay - Stronger for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00665e]/50 via-[#00665e]/50 to-[#004d47]/50" />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-[#00665e] font-bold text-2xl">B</span>
                        </div>
                        <h2
                            className="text-2xl font-bold leading-tight tracking-tight drop-shadow-md"
                            style={{ color: '#f15a23' }}
                        >
                            BNI Kredit Konsumer
                        </h2>
                    </div>

                    {/* Welcome Message */}
                    <div className="max-w-lg">
                        <h1
                            className="text-4xl xl:text-5xl font-black leading-tight tracking-tight mb-6 drop-shadow-lg"
                            style={{ color: '#f15a23' }}
                        >
                            Sistem Manajemen Kredit Konsumer
                        </h1>
                        <p className="text-lg xl:text-xl font-medium text-white leading-relaxed drop-shadow-md">
                            Portal Internal untuk Karyawan BNI. Kelola pengajuan kredit, periksa skor kredit, dan proses persetujuan dengan efisien.
                        </p>
                    </div>

                    {/* Footer Info */}
                    <div className="text-sm text-white/90 font-medium drop-shadow-sm">
                        <p>Sistem Internal v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col justify-center bg-white dark:bg-[#1e293b] px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 text-[#00665e]">
                        <div className="w-10 h-10 bg-[#00665e] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                            BNI Kredit Konsumer
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="flex flex-col gap-2 mb-8">
                        <h2 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                            Masuk
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base">
                            Selamat datang kembali! Silakan masukkan data Anda.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold leading-6 text-gray-800 dark:text-gray-200 mb-2"
                            >
                                Username atau ID Karyawan
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Masukkan ID Anda"
                                    required
                                    className="block w-full rounded-lg border-0 py-3.5 pl-4 pr-10 
                                        text-gray-900 dark:text-white
                                        ring-1 ring-inset ring-gray-300 dark:ring-gray-600
                                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                                        focus:ring-2 focus:ring-inset focus:ring-[#00665e]
                                        sm:text-sm sm:leading-6 
                                        bg-white dark:bg-gray-800"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold leading-6 text-gray-800 dark:text-gray-200 mb-2"
                            >
                                Kata Sandi
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan kata sandi"
                                    required
                                    className="block w-full rounded-lg border-0 py-3.5 pl-4 pr-10 
                                        text-gray-900 dark:text-white
                                        ring-1 ring-inset ring-gray-300 dark:ring-gray-600
                                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                                        focus:ring-2 focus:ring-inset focus:ring-[#00665e]
                                        sm:text-sm sm:leading-6 
                                        bg-white dark:bg-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-[#00665e] transition-colors" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#00665e] transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-[#00665e] focus:ring-[#00665e] 
                                        bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                >
                                    Ingat saya
                                </label>
                            </div>
                            <div className="text-sm leading-6">
                                <a
                                    href="#"
                                    className="font-semibold text-[#00665e] hover:text-[#004d47] transition-colors"
                                >
                                    Lupa kata sandi?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-lg bg-[#00665e] px-3 py-3.5 
                                    text-sm font-semibold leading-6 text-white shadow-sm 
                                    hover:bg-[#004d47] 
                                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00665e] 
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    "Masuk"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                <strong className="font-semibold">
                                    Peringatan Keamanan:
                                </strong>{" "}
                                Akses tidak sah dilarang dan dipantau. Pastikan Anda terhubung ke jaringan internal yang aman.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} PT Bank Negara Indonesia (Persero) Tbk.
                    </p>
                </div>
            </div>
        </div>
    );
}
