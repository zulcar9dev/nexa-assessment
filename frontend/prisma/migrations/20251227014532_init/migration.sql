-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('PRAPURNA_REGULER', 'PRAPURNA_TAKEOVER', 'PURNA_REGULER', 'PURNA_TAKEOVER');

-- CreateEnum
CREATE TYPE "JenisPengajuan" AS ENUM ('BARU', 'TOP_UP', 'TOP_UP_SISA_GAJI', 'TAKEOVER');

-- CreateEnum
CREATE TYPE "Segmentasi" AS ENUM ('TASPEN', 'ASABRI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "employee_id" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debiturs" (
    "id" TEXT NOT NULL,
    "nama_pemohon" TEXT NOT NULL,
    "no_ktp" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "jenis_pengajuan" "JenisPengajuan" NOT NULL DEFAULT 'BARU',
    "segmentasi" "Segmentasi" NOT NULL DEFAULT 'TASPEN',
    "data_lengkap" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "debiturs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE INDEX "debiturs_nama_pemohon_idx" ON "debiturs"("nama_pemohon");

-- CreateIndex
CREATE INDEX "debiturs_no_ktp_idx" ON "debiturs"("no_ktp");

-- CreateIndex
CREATE INDEX "debiturs_kategori_idx" ON "debiturs"("kategori");

-- CreateIndex
CREATE INDEX "debiturs_user_id_idx" ON "debiturs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "templates_kategori_key" ON "templates"("kategori");

-- AddForeignKey
ALTER TABLE "debiturs" ADD CONSTRAINT "debiturs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
