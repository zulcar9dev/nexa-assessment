CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debiturs" (
	"id" text PRIMARY KEY NOT NULL,
	"nama_pemohon" text NOT NULL,
	"no_ktp" text NOT NULL,
	"kategori" text NOT NULL,
	"jenis_pengajuan" text DEFAULT 'BARU' NOT NULL,
	"segmentasi" text DEFAULT 'TASPEN' NOT NULL,
	"data_lengkap" jsonb NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "debitur_ktp_jenis_unique" UNIQUE("no_ktp","jenis_pengajuan")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"judul" text NOT NULL,
	"nomor_memo" text NOT NULL,
	"kategori" text NOT NULL,
	"target_market" text NOT NULL,
	"status" text DEFAULT 'AKTIF' NOT NULL,
	"berlaku_mulai" timestamp NOT NULL,
	"berlaku_akhir" timestamp NOT NULL,
	"keywords" text[] NOT NULL,
	"filename" text NOT NULL,
	"filepath" text NOT NULL,
	"filesize" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"replaced_by_id" text,
	"uploaded_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"kategori" text NOT NULL,
	"name" text NOT NULL,
	"filename" text NOT NULL,
	"path" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_kategori_unique" UNIQUE("kategori")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"employee_id" text,
	"password" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debiturs" ADD CONSTRAINT "debiturs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "debitur_nama_pemohon_idx" ON "debiturs" USING btree ("nama_pemohon");--> statement-breakpoint
CREATE INDEX "debitur_no_ktp_idx" ON "debiturs" USING btree ("no_ktp");--> statement-breakpoint
CREATE INDEX "debitur_kategori_idx" ON "debiturs" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "debitur_user_id_idx" ON "debiturs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_judul_idx" ON "documents" USING btree ("judul");--> statement-breakpoint
CREATE INDEX "document_nomor_memo_idx" ON "documents" USING btree ("nomor_memo");--> statement-breakpoint
CREATE INDEX "document_kategori_idx" ON "documents" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "document_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_target_market_idx" ON "documents" USING btree ("target_market");--> statement-breakpoint
CREATE INDEX "document_berlaku_akhir_idx" ON "documents" USING btree ("berlaku_akhir");--> statement-breakpoint
CREATE INDEX "document_uploaded_by_id_idx" ON "documents" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");