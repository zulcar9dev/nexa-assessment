/*
  Warnings:

  - The values [PRAPURNA_REGULER,PRAPURNA_TAKEOVER,PURNA_REGULER,PURNA_TAKEOVER] on the enum `Kategori` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Kategori_new" AS ENUM ('PRAPURNA', 'PURNA');
ALTER TABLE "debiturs" ALTER COLUMN "kategori" TYPE "Kategori_new" USING ("kategori"::text::"Kategori_new");
ALTER TABLE "templates" ALTER COLUMN "kategori" TYPE "Kategori_new" USING ("kategori"::text::"Kategori_new");
ALTER TYPE "Kategori" RENAME TO "Kategori_old";
ALTER TYPE "Kategori_new" RENAME TO "Kategori";
DROP TYPE "Kategori_old";
COMMIT;
