"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, User, AlertCircle, Clock } from "lucide-react";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const authError = searchParams.get("error");
    const logoutReason = searchParams.get("reason");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        authError === "CredentialsSignin" ? "Email/ID atau password salah" : null
    );
    const [idleLogout] = useState(logoutReason === "idle");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError(result.error === "CredentialsSignin"
                    ? "Email/ID atau password salah"
                    : result.error
                );
                setIsLoading(false);
                return;
            }

            if (result?.ok) {
                // Also set cookie for middleware compatibility
                document.cookie = "auth-session=authenticated; path=/; max-age=86400";
                window.location.href = callbackUrl;
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (type: "admin" | "user") => {
        setIsLoading(true);
        setError(null);

        const credentials = type === "admin"
            ? { email: "admin@bni.co.id", password: "admin123" }
            : { email: "user@bni.co.id", password: "user123" };

        try {
            const result = await signIn("credentials", {
                ...credentials,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError("Demo login gagal. Pastikan database sudah di-seed.");
                setIsLoading(false);
                return;
            }

            if (result?.ok) {
                document.cookie = "auth-session=authenticated; path=/; max-age=86400";
                window.location.href = callbackUrl;
            }
        } catch (err) {
            console.error("Demo login error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-1">
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

                    <div className="text-sm text-white/90 font-medium drop-shadow-sm">
                        <p>Sistem Internal v{process.env.APP_VERSION}</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col justify-center bg-white dark:bg-[#1e293b] px-4 py-6 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-y-auto">
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
                    <div className="flex flex-col gap-1 mb-6">
                        <h2 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                            Masuk
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base">
                            Selamat datang kembali! Silakan masukkan data Anda.
                        </p>
                    </div>

                    {/* Idle Timeout Alert */}
                    {idleLogout && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Sesi Berakhir
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                                    Anda telah logout otomatis karena tidak ada aktivitas selama 10 menit. Silakan login kembali.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold leading-6 text-gray-800 dark:text-gray-200 mb-2"
                            >
                                Email atau ID Karyawan
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Masukkan email atau ID"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
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

                    {/* Demo Login Buttons */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-[#1e293b] px-2 text-gray-500 dark:text-gray-400">
                                    Demo Login
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("admin")}
                                disabled={isLoading}
                                className="flex justify-center items-center rounded-lg px-3 py-2.5 
                  text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  ring-1 ring-inset ring-gray-300 dark:ring-gray-600
                  transition-colors disabled:opacity-50"
                            >
                                Admin Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin("user")}
                                disabled={isLoading}
                                className="flex justify-center items-center rounded-lg px-3 py-2.5 
                  text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  ring-1 ring-inset ring-gray-300 dark:ring-gray-600
                  transition-colors disabled:opacity-50"
                            >
                                User Demo
                            </button>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
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
                    <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} PT Bank Negara Indonesia (Persero) Tbk.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1e293b]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-[#00665e] rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white font-bold text-2xl">B</span>
                    </div>
                    <p className="text-[#00665e] font-medium text-sm animate-pulse">Memuat...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
