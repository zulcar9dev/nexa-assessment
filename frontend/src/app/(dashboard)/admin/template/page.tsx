"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  ShieldX,
} from "lucide-react";

const templateCategories = [
  {
    key: "aktif_reguler",
    nama: "BNI Fleksi Aktif",
    filename: "template_aktif.docx",
    updatedAt: "2025-01-15",
  },
  {
    key: "prapurna_reguler",
    nama: "BNI Fleksi Pensiun Prapurna",
    filename: "template_prapurna.docx",
    updatedAt: "2024-12-20",
  },
  {
    key: "purna_reguler",
    nama: "BNI Fleksi Pensiun Purna",
    filename: "template_purna.docx",
    updatedAt: "2024-12-15",
  },
];

export default function AdminTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Check if user is admin
  const isAdmin =
    (session?.user as { role?: string })?.role?.toLowerCase() === "admin";

  // Redirect non-admin users
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/");
    }
  }, [status, isAdmin, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat...</span>
        </div>
      </div>
    );
  }

  // Access denied
  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Anda tidak memiliki izin untuk mengakses halaman ini
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#00665e] text-white rounded-lg hover:bg-[#004d47]"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    kategori: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.endsWith(".docx")) {
        setUploadStatus("error");
        setTimeout(() => setUploadStatus("idle"), 3000);
        return;
      }

      // Simulate upload success
      setSelectedCategory(kategori);
      setUploadStatus("success");
      setTimeout(() => {
        setUploadStatus("idle");
        setSelectedCategory("");
      }, 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4] mb-2">
          Kelola Template
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload file template .docx baru untuk mengganti template yang sudah
          ada.
        </p>
      </div>

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 dark:text-green-400">
            Template berhasil diperbarui!
          </span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 dark:text-red-400">
            Format file tidak diizinkan. Harap upload file .docx
          </span>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templateCategories.map((template) => (
          <div
            key={template.key}
            className="card card-hover overflow-hidden group"
          >
            {/* Header */}
            <div className="h-2 bg-gradient-to-r from-[#00665e] to-[#004d47]" />

            <div className="p-6">
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#e0f2f1] dark:bg-[#00665e]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#00665e] dark:text-[#80cbc4]" />
                </div>
                <div>
                  <h3 className="card-title font-bold mb-1">{template.nama}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Template untuk dokumen kredit
                  </p>
                </div>
              </div>

              {/* File Info */}
              <div className="bg-gray-50 dark:bg-[#323249] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    File saat ini:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00665e] dark:text-[#80cbc4]" />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {template.filename}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Terakhir diupdate: {formatDate(template.updatedAt)}
                </p>
              </div>

              {/* Upload Button */}
              <label className="block">
                <input
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, template.key)}
                />
                <div
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3
                    border-2 border-dashed rounded-lg cursor-pointer
                    transition-all duration-200
                    ${
                      selectedCategory === template.key &&
                      uploadStatus === "success"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-[#444564] hover:border-[#00665e] hover:bg-[#e0f2f1] dark:hover:bg-[#00665e]/10"
                    }
                  `}
                >
                  {selectedCategory === template.key &&
                  uploadStatus === "success" ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">
                        Berhasil!
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Upload Template Baru
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="card p-6 bg-[#fff3e0] dark:bg-[#f15a23]/10 border-[#f15a23]/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#f15a23]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#f15a23]" />
          </div>
          <div>
            <h4 className="font-semibold text-[#f15a23] mb-1">
              Format Template
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Template Word menggunakan sintaks Jinja2, contoh:{" "}
              {"{{ nama_pemohon }}"}, {"{{ usulan_plafon_kredit }}"}. Jangan
              mengubah nama variabel di dalam .docx kecuali Anda juga
              menyesuaikan key JSON di backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
