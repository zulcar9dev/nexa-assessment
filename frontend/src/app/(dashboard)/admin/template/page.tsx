"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  ShieldX,
  ChevronRight,
  Plus,
  Library,
  BadgeCheck,
  FileEdit,
  Grid2X2,
  Eye,
  LayoutGrid,
  List,
} from "lucide-react";

const templateCategories = [
  {
    key: "type_c_reguler",
    nama: "Assessment Type C (Active)",
    filename: "template_type_c.docx",
    updatedAt: "2025-01-15",
  },
  {
    key: "type_a_reguler",
    nama: "Assessment Type A (Pre-Period)",
    filename: "template_type_a.docx",
    updatedAt: "2024-12-20",
  },
  {
    key: "type_b_reguler",
    nama: "Assessment Type B (Full-Period)",
    filename: "template_type_b.docx",
    updatedAt: "2024-12-15",
  },
];

export default function AdminTemplatePage() {
  const { data: session, isPending } = authClient.useSession();
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
    if (!isPending && !!session && !isAdmin) {
      router.push("/");
    }
  }, [isPending, session, isAdmin, router]);

  // Loading state
  if (isPending) {
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
  if (!isPending && !!session && !isAdmin) {
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
            className="px-4 py-2 bg-primary-brand text-white rounded-lg hover:bg-primary-brand-dark"
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
    <div className="max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-xs">
            <span>Admin</span>
            <ChevronRight className="w-[14px] h-[14px]" />
            <span className="text-primary font-semibold">Templates</span>
          </nav>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Kelola Template
          </h3>
          <p className="text-on-surface-variant">
            Upload file template .docx baru untuk mengganti template yang sudah ada.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-sm bg-primary text-on-primary px-xl py-md rounded-lg font-title-sm shadow-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-5 h-5 font-bold" />
          Buat Template Baru
        </button>
      </div>

      {/* Dashboard Filters & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        <div className="bg-surface-light p-lg rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Template
            </p>
            <p className="font-headline-md text-on-surface">24</p>
          </div>
        </div>
        <div className="bg-surface-light p-lg rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              Aktif
            </p>
            <p className="font-headline-md text-on-surface">18</p>
          </div>
        </div>
        <div className="bg-surface-light p-lg rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              Draft
            </p>
            <p className="font-headline-md text-on-surface">6</p>
          </div>
        </div>
        <div className="bg-surface-light p-lg rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
            <Grid2X2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              Kategori
            </p>
            <p className="font-headline-md text-on-surface">5</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg animate-in fade-in duration-300">
          <Check className="w-5 h-5 text-success" />
          <span className="text-success font-medium">
            Template berhasil diperbarui!
          </span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-lg animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-danger" />
          <span className="text-danger font-medium">
            Format file tidak diizinkan. Harap upload file .docx
          </span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md mb-lg">
        <div className="flex flex-wrap items-center gap-sm">
          <button className="px-md py-sm bg-primary/10 text-primary border border-primary/20 rounded-full text-label-sm font-semibold">
            Semua
          </button>
          <button className="px-md py-sm bg-surface-light text-on-surface-variant border border-outline-variant/30 rounded-full text-label-sm font-semibold hover:bg-surface-container transition-colors">
            Payroll
          </button>
          <button className="px-md py-sm bg-surface-light text-on-surface-variant border border-outline-variant/30 rounded-full text-label-sm font-semibold hover:bg-surface-container transition-colors">
            Human Resources
          </button>
          <button className="px-md py-sm bg-surface-light text-on-surface-variant border border-outline-variant/30 rounded-full text-label-sm font-semibold hover:bg-surface-container transition-colors">
            IT Audit
          </button>
          <button className="px-md py-sm bg-surface-light text-on-surface-variant border border-outline-variant/30 rounded-full text-label-sm font-semibold hover:bg-surface-container transition-colors">
            Compliance
          </button>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-label-sm text-on-surface-variant">Urutkan:</span>
          <select className="bg-surface-light border border-outline-variant/30 rounded-lg text-label-sm focus:ring-primary focus:border-primary">
            <option>Terbaru</option>
            <option>Nama (A-Z)</option>
            <option>Status</option>
          </select>
          <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-lg p-1">
            <button className="p-1 text-primary bg-surface-light rounded shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {templateCategories.map((template) => (
          <div
            key={template.key}
            className="card-hover bg-surface-light rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm group"
          >
            {/* Header */}
            <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary-container" />

            <div className="p-lg">
              {/* Icon & Title */}
              <div className="flex justify-between items-start mb-md">
                <div className="p-sm bg-primary/10 rounded-lg text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                  Aktif
                </span>
              </div>

              <h4 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
                {template.nama}
              </h4>
              <p className="text-label-sm text-on-surface-variant mb-lg">
                Template untuk dokumen kredit
              </p>

              {/* File Info */}
              <div className="flex flex-col py-md border-y border-outline-variant/20 mb-lg gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">File saat ini:</span>
                  <span className="text-sm font-mono text-on-surface font-semibold flex items-center gap-1">
                    <FileText className="w-4 h-4 text-primary" /> {template.filename}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Terakhir diupdate:</span>
                  <span className="text-sm font-bold text-on-surface">
                    {formatDate(template.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-sm">
                <button className="flex items-center justify-center gap-xs border border-outline-variant/30 text-on-surface-variant px-md py-sm rounded-lg text-label-sm font-semibold hover:bg-surface-container transition-colors">
                  <Eye className="w-[18px] h-[18px]" />
                  Preview
                </button>
                <label
                  className={`
                    cursor-pointer flex items-center justify-center gap-xs px-md py-sm rounded-lg text-label-sm font-semibold transition-colors
                    ${
                      selectedCategory === template.key && uploadStatus === "success"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }
                  `}
                >
                  <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, template.key)}
                  />
                  {selectedCategory === template.key && uploadStatus === "success" ? (
                    <>
                      <Check className="w-[18px] h-[18px]" />
                      Berhasil!
                    </>
                  ) : (
                    <>
                      <Upload className="w-[18px] h-[18px]" />
                      Upload Baru
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Placeholder */}
        <button className="flex flex-col items-center justify-center gap-md bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-xl p-lg group hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 min-h-[300px]">
          <div className="w-16 h-16 bg-surface-light rounded-full shadow-md flex items-center justify-center text-primary/50 group-hover:text-primary group-hover:scale-110 transition-transform">
            <Plus className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="font-title-sm text-on-surface">Buat Template Baru</p>
            <p className="text-label-sm text-on-surface-variant">
              Gunakan framework custom anda sendiri
            </p>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-warning/10 border border-warning/20 p-6 rounded-xl mt-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h4 className="font-semibold text-warning mb-1">
              Format Template
            </h4>
            <p className="text-sm text-warning/80">
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
