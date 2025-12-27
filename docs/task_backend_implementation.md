# Task: Backend Implementation
## Aplikasi Kredit Konsumer BNI

**Created:** 27 Desember 2024  
**Updated:** 27 Desember 2024  
**Status:** 🔄 IN PROGRESS (Phase 1-8 Complete, Waiting for PostgreSQL)

---

## Executive Summary

Task ini mencakup implementasi lengkap backend untuk Aplikasi Kredit Konsumer BNI menggunakan Next.js API Routes, Prisma ORM, dan PostgreSQL. Frontend sudah selesai 100%, sekarang fokus pada integrasi backend.

---

## Current Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Setup Database & Prisma | ✅ Files Created |
| Phase 2 | Authentication Setup | ✅ Files Created |
| Phase 3 | Core Services | ✅ Files Created |
| Phase 4 | API Routes - Calculation | ✅ Files Created |
| Phase 5 | API Routes - Debitur CRUD | ✅ Files Created |
| Phase 6 | API Routes - Template | ✅ Files Created |
| Phase 7 | Database Seed & Migration | ⏳ Need DB Running |
| Phase 8 | Frontend Integration | ✅ Complete |
| Phase 9 | Testing & Verification | ⏳ Pending |

---

## Prerequisites

Sebelum memulai implementasi, pastikan:

- [x] Node.js v18+ terinstall
- [x] Frontend sudah berjalan (`npm run dev`)
- [x] Dependencies terinstall (prisma, next-auth, bcryptjs, docx)
- [ ] PostgreSQL terinstall dan berjalan
- [ ] DATABASE_URL sudah dikonfigurasi dengan database PostgreSQL aktif

---

## Task Breakdown

### Phase 1: Setup Database & Prisma ✅ FILES CREATED

**Estimasi:** 20 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 1.1 | Install Prisma dependencies | - | ✅ Done |
| 1.2 | Initialize Prisma | - | ✅ Done |
| 1.3 | Create database schema | `prisma/schema.prisma` | ✅ Done |
| 1.4 | Create Prisma client singleton | `src/lib/prisma.ts` | ✅ Done |
| 1.5 | Setup environment variables | `.env.local` | ✅ Created |
| 1.6 | Run database migration | - | ⏳ Need PostgreSQL |

**Next Step - Run after PostgreSQL is ready:**
```bash
cd frontend
npx prisma migrate dev --name init
npx prisma generate
```

---

### Phase 2: Authentication Setup ✅ FILES CREATED

**Estimasi:** 30 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 2.1 | Install NextAuth.js | - | ✅ Done |
| 2.2 | Create auth configuration | `src/lib/auth.ts` | ✅ Done |
| 2.3 | Create NextAuth route handler | `src/app/api/auth/[...nextauth]/route.ts` | ✅ Done |
| 2.4 | Add auth environment variables | `.env.local` | ✅ Done |
| 2.5 | Create seed user | `prisma/seed.ts` | ✅ Done |

---

### Phase 3: Core Services ✅ FILES CREATED

**Estimasi:** 30 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 3.1 | Create calculation service | `src/services/calculation.service.ts` | ✅ Done |
| 3.2 | Create document service | `src/services/document.service.ts` | ✅ Done |
| 3.3 | Create debitur service | `src/services/debitur.service.ts` | ✅ Done |
| 3.4 | Create template service | `src/services/template.service.ts` | ✅ Done |
| 3.5 | Create API types | `src/types/api.ts` | ✅ Done |
| 3.6 | Create barrel export | `src/services/index.ts` | ✅ Done |

---

### Phase 4: API Routes - Calculation ✅ FILES CREATED

**Estimasi:** 20 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 4.1 | Create PMT calculation API | `src/app/api/calculate/pmt/route.ts` | ✅ Done |
| 4.2 | Create DSR calculation API | `src/app/api/calculate/dsr/route.ts` | ✅ Done |

**Endpoints:**
- `POST /api/calculate/pmt` - Calculate monthly payment (PMT)
- `POST /api/calculate/dsr` - Calculate Debt Service Ratio

---

### Phase 5: API Routes - Debitur CRUD ✅ FILES CREATED

**Estimasi:** 30 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 5.1 | Create debitur list/create API | `src/app/api/debitur/route.ts` | ✅ Done |
| 5.2 | Create debitur detail/update/delete API | `src/app/api/debitur/[id]/route.ts` | ✅ Done |
| 5.3 | Create document download API | `src/app/api/debitur/[id]/download/route.ts` | ✅ Done |

**Endpoints:**
- `GET /api/debitur` - List all debitur with pagination & filters
- `POST /api/debitur` - Create new debitur
- `GET /api/debitur/[id]` - Get debitur detail
- `PUT /api/debitur/[id]` - Update debitur
- `DELETE /api/debitur/[id]` - Delete debitur
- `GET /api/debitur/[id]/download` - Generate & download DOCX

---

### Phase 6: API Routes - Template Management ✅ FILES CREATED

**Estimasi:** 15 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 6.1 | Create template list/upload API | `src/app/api/template/route.ts` | ✅ Done |
| 6.2 | Copy template files | `templates/` | ✅ Done |

**Endpoints:**
- `GET /api/template` - List all templates
- `POST /api/template` - Upload new template

---

### Phase 7: Database Seed & Migration ⏳ PENDING

**Estimasi:** 15 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 7.1 | Create seed script | `prisma/seed.ts` | ✅ Done |
| 7.2 | Add seed script to package.json | `package.json` | ✅ Done |
| 7.3 | Run migration | - | ⏳ Need PostgreSQL |
| 7.4 | Run seed | - | ⏳ Need PostgreSQL |

**Commands (run when PostgreSQL is ready):**
```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# Run seed
npx prisma db seed
```

---

### Phase 8: Frontend Integration ⏳ PENDING

**Estimasi:** 30 menit

| Step | Task | File | Status |
|------|------|------|--------|
| 8.1 | Update useDebitur hook for real API | `src/hooks/use-debitur.ts` | ⏳ |
| 8.2 | Update useCalculation hook for real API | `src/hooks/use-calculation.ts` | ⏳ |
| 8.3 | Update login page for real auth | `src/app/(auth)/login/page.tsx` | ⏳ |
| 8.4 | Update middleware for real auth | `src/middleware.ts` | ⏳ |
| 8.5 | Connect form submission to API | `src/stores/form-store.ts` | ⏳ |

---

### Phase 9: Testing & Verification ⏳ PENDING

**Estimasi:** 20 menit

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Login with valid credentials | Redirect to dashboard | ⏳ |
| Login with invalid credentials | Show error message | ⏳ |
| Create new debitur | Save to database, redirect | ⏳ |
| PMT calculation | Correct amount returned | ⏳ |
| DSR calculation | Correct percentage, validation | ⏳ |
| Download DOCX | File downloaded with data | ⏳ |
| List debitur with filters | Filtered results returned | ⏳ |
| Protected routes | Redirect to login if unauthorized | ⏳ |

---

## Files Created ✅

### Backend Files (18 files created)

| # | File Path | Description | Status |
|---|-----------|-------------|--------|
| 1 | `frontend/.env.local` | Environment variables | ✅ |
| 2 | `frontend/prisma/schema.prisma` | Database schema | ✅ |
| 3 | `frontend/prisma/seed.ts` | Database seeding | ✅ |
| 4 | `frontend/src/lib/prisma.ts` | Prisma client singleton | ✅ |
| 5 | `frontend/src/lib/auth.ts` | NextAuth configuration | ✅ |
| 6 | `frontend/src/types/api.ts` | API types | ✅ |
| 7 | `frontend/src/services/calculation.service.ts` | PMT/DSR calculations | ✅ |
| 8 | `frontend/src/services/document.service.ts` | DOCX generation | ✅ |
| 9 | `frontend/src/services/debitur.service.ts` | Debitur CRUD | ✅ |
| 10 | `frontend/src/services/template.service.ts` | Template management | ✅ |
| 11 | `frontend/src/services/index.ts` | Barrel export | ✅ |
| 12 | `frontend/src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler | ✅ |
| 13 | `frontend/src/app/api/calculate/pmt/route.ts` | PMT calculation API | ✅ |
| 14 | `frontend/src/app/api/calculate/dsr/route.ts` | DSR calculation API | ✅ |
| 15 | `frontend/src/app/api/debitur/route.ts` | Debitur list/create | ✅ |
| 16 | `frontend/src/app/api/debitur/[id]/route.ts` | Debitur detail/update/delete | ✅ |
| 17 | `frontend/src/app/api/debitur/[id]/download/route.ts` | Download DOCX | ✅ |
| 18 | `frontend/src/app/api/template/route.ts` | Template management | ✅ |

### Template Files Copied

| # | File Path | Status |
|---|-----------|--------|
| 1 | `frontend/templates/template_prapurna_reguler.docx` | ✅ |
| 2 | `frontend/templates/template_prapurna_takeover.docx` | ✅ |
| 3 | `frontend/templates/template_purna_reguler.docx` | ✅ |

---

## Next Steps (Action Required)

### 1. Setup PostgreSQL Database

```bash
# Option A: Install PostgreSQL locally
# Download from https://www.postgresql.org/download/

# Option B: Use Docker
docker run --name postgres-kredit -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Create database
psql -U postgres -c "CREATE DATABASE kredit_konsumer;"
```

### 2. Run Database Migration & Seed

```bash
cd frontend

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed database with demo users
npx prisma db seed
```

### 3. Verify Login Credentials

After seeding, these credentials will work:
- **Admin:** admin@bni.co.id / admin123
- **User:** user@bni.co.id / user123

---

## Environment Variables

File `.env.local` sudah dibuat dengan nilai default:

```env
# Database - UPDATE THIS with your PostgreSQL connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kredit_konsumer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretkey12345678901234567890"

# App
NODE_ENV="development"
```

---

## Notes

- ⚠️ PostgreSQL harus running sebelum menjalankan migration
- ⚠️ Pastikan `DATABASE_URL` sudah benar di `.env.local`
- Setelah migration berhasil, Prisma client akan di-generate
- Template DOCX sudah dicopy ke `frontend/templates/`
- Secret key harus diganti untuk production
