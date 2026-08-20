CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"slik_mitigasi_risk_text" text NOT NULL,
	"catatan_program_pricing" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "recommendations" jsonb;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "retirement_plan" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pension_benefits" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "health_conditions" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "medications" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "exercise_frequency" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "social_activities" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "community_involvement" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "file_data" text;--> statement-breakpoint
INSERT INTO "app_settings" ("id", "slik_mitigasi_risk_text", "catatan_program_pricing")
VALUES ('default', 'Mitigasi Risiko Cfm. Surat No. NSD/2/0216 Penyampaian Program Relaksasi Sistem Layanan Informasi Keuangan (SLIK) Nexa Fleksi Pensiun (BFP) Semester I Tahun 2026 tanggal 13 Januari 2026', '(Cfm Surat No NSD/2/4293 Penyampaian Program KTA Nexa Fleksi (Aktif & Pensiun) dan KPR Nexa Griya khusus HUT Nexa ke - 80)')
ON CONFLICT ("id") DO NOTHING;