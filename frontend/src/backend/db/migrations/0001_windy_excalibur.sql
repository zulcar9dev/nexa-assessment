ALTER TABLE "debiturs" DROP CONSTRAINT "debitur_ktp_jenis_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "debiturs" ADD COLUMN "status" text DEFAULT 'SUBMITTED' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "debitur_ktp_jenis_submitted_unique" ON "debiturs" USING btree ("no_ktp","jenis_pengajuan") WHERE status = 'SUBMITTED';