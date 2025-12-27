# Backend Implementation Plan
## Aplikasi Kredit Konsumer BNI

**Last Updated:** 27 Desember 2024  
**Status:** 🚧 IN PROGRESS

---

## Implementation Summary

| Kategori | Total Files | Status |
|----------|-------------|--------|
| API Routes | 8 | ✅ Done |
| Services | 4 | ✅ Done |
| Lib | 5 | ✅ Done |
| Types | 4 | ✅ Done |
| Prisma Schema | 1 | ✅ Done |
| Database Seed | 1 | ✅ Done |
| Templates | 4 | 🚧 Partial (3/4 Present) |

---

## 🛠️ Tech Stack Backend

| Teknologi | Versi | Fungsi | Status |
|-----------|-------|--------|--------|
| Next.js API Routes | 16.x | REST API endpoints | ✅ Implemented |
| Prisma | 5.x | ORM & database toolkit | ✅ Configured |
| PostgreSQL | 15.x | Database utama | ✅ Configured |
| NextAuth.js | 4.x | Authentication | ✅ Configured |
| Zod | 3.x | Request validation | ✅ Installed |
| bcryptjs | Latest | Password hashing | ✅ Installed |
| docx | 8.x | Generate DOCX documents | ✅ Installed |

---

## 📁 Struktur Folder Backend (PLANNED)

```
frontend/
├── prisma/
│   ├── schema.prisma                 ✅ Database schema
│   └── migrations/                   ✅ Database migrations
├── scripts/
│   └── seed.ts                       ✅ Database seeding
├── src/
│   ├── app/
│   │   └── api/                      # API Routes
│   │       ├── auth/                 # Authentication
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts      ✅ NextAuth handler
│   │       ├── debitur/              # Debitur CRUD
│   │       │   ├── route.ts          ✅ GET all, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts      ✅ GET one, PUT, DELETE
│   │       │       └── download/
│   │       │           └── route.ts  ✅ Generate DOCX
│   │       ├── calculate/            # Calculation APIs
│   │       │   ├── pmt/
│   │       │   │   └── route.ts      ✅ Calculate PMT
│   │       │   └── dsr/
│   │       │       └── route.ts      ✅ Calculate DSR
│   │       └── template/             # Template Management
│   │           └── route.ts          ✅ GET all, POST upload
│   ├── services/                     # Business Logic
│   │   ├── debitur.service.ts        ✅ Debitur CRUD logic
│   │   ├── calculation.service.ts    ✅ PMT, DSR calculations
│   │   ├── document.service.ts       ✅ DOCX generation
│   │   └── template.service.ts       ✅ Template management
│   ├── lib/                          # Utility Libraries
│   │   ├── prisma.ts                 ✅ Prisma client singleton
│   │   ├── auth.ts                   ✅ NextAuth config
│   │   └── utils.ts                  ✅ Utility functions
│   └── types/                        # TypeScript Types
│       └── api.ts                    ✅ API types
templates/                            # Templates (in frontend/templates)
├── template_prapurna_reguler.docx    ✅ Present
├── template_prapurna_takeover.docx   ✅ Present
├── template_purna_reguler.docx       ✅ Present
└── template_purna_takeover.docx      ⏳ Missing
```

---

## 🗄️ Database Schema

### Prisma Schema

#### [NEW] [schema.prisma](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ USER & AUTH ============
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  debiturs      Debitur[]
}

enum Role {
  ADMIN
  USER
}

// ============ DEBITUR ============
model Debitur {
  id              String          @id @default(cuid())
  namaPemohon     String
  noKtp           String
  kategori        Kategori
  jenisPengajuan  JenisPengajuan  @default(BARU)
  segmentasi      Segmentasi      @default(TASPEN)
  dataLengkap     Json            // Menyimpan semua field form
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       User            @relation(fields: [userId], references: [id])
  userId          String

  @@index([namaPemohon])
  @@index([noKtp])
  @@index([kategori])
}

enum Kategori {
  PRAPURNA_REGULER
  PRAPURNA_TAKEOVER
  PURNA_REGULER
  PURNA_TAKEOVER
}

enum JenisPengajuan {
  BARU
  TOP_UP
  TOP_UP_SISA_GAJI
  TAKEOVER
}

enum Segmentasi {
  TASPEN
  ASABRI
}

// ============ TEMPLATE ============
model Template {
  id        String   @id @default(cuid())
  kategori  Kategori @unique
  filename  String
  path      String
  updatedAt DateTime @updatedAt
}
```

---

## 🔌 API Endpoints

### 1. Debitur CRUD ✅

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/route.ts)

**GET /api/debitur** - List semua debitur dengan filter

```typescript
// Query params
interface DebiturQueryParams {
  q?: string;           // Search nama/NIK
  jenis?: JenisPengajuan;
  segmentasi?: Segmentasi;
  kategori?: Kategori;
  page?: number;
  limit?: number;
}

// Response
interface DebiturListResponse {
  data: Debitur[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**POST /api/debitur** - Create debitur baru

```typescript
// Request body
interface CreateDebiturRequest {
  namaPemohon: string;
  noKtp: string;
  kategori: Kategori;
  jenisPengajuan: JenisPengajuan;
  segmentasi: Segmentasi;
  dataLengkap: Record<string, any>;
}

// Response
interface DebiturResponse {
  success: boolean;
  data: Debitur;
}
```

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/[id]/route.ts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/debitur/[id] | Get detail debitur |
| PUT | /api/debitur/[id] | Update debitur |
| DELETE | /api/debitur/[id] | Hapus debitur |

---

### 2. Calculation APIs ✅

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/calculate/pmt/route.ts)

**POST /api/calculate/pmt** - Hitung angsuran (PMT)

```typescript
// Request body
interface PMTRequest {
  principal: number;      // Plafon kredit
  annualRate: number;     // Bunga per tahun (%)
  months: number;         // Tenor (bulan)
}

// Response
interface PMTResponse {
  angsuran: number;
  totalBayar: number;
  totalBunga: number;
}
```

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/calculate/dsr/route.ts)

**POST /api/calculate/dsr** - Hitung DSR

```typescript
// Request body
interface DSRRequest {
  penghasilan: number;
  angsuranBaru: number;
  angsuranEksisting: number[];
}

// Response
interface DSRResponse {
  dsr: number;            // Persentase DSR
  dsc90: number;          // 90% dari penghasilan
  totalAngsuran: number;
  maksimalAngsuran: number;
  isValid: boolean;       // false jika DSR > 90%
  message?: string;
}
```

---

### 3. Document Generation ✅

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/[id]/download/route.ts)

**GET /api/debitur/[id]/download** - Generate dan download DOCX

```typescript
// Response: File stream .docx
// Headers:
// Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
// Content-Disposition: attachment; filename="Kredit_[NamaDebitur]_[NIK].docx"
```

---

### 4. Template Management ✅

#### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/template/route.ts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/template | List semua template |
| POST | /api/template | Upload template baru (multipart/form-data) |

---

## ⚙️ Business Logic Services

### Calculation Service ✅

#### [NEW] [calculation.service.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/services/calculation.service.ts)

Migrasi dari `utils.py`:

```typescript
export class CalculationService {
  /**
   * Menghitung angsuran bulanan (PMT)
   * Rumus: P * (r(1+r)^n) / ((1+r)^n - 1)
   */
  static calculatePMT(
    principal: number,
    annualRatePercent: number,
    months: number
  ): number;

  /**
   * Menghitung Debt Service Ratio
   * DSR = (Total Angsuran / Penghasilan) * 100
   */
  static calculateDSR(
    penghasilan: number,
    totalAngsuran: number
  ): number;

  /**
   * Validasi DSR tidak melebihi 90%
   */
  static validateDSR(dsr: number): boolean;

  /**
   * Menghitung kapasitas angsuran maksimal
   * Maks = (90% * Penghasilan) - Angsuran Eksisting
   */
  static calculateMaxCapacity(
    penghasilan: number,
    angsuranEksisting: number
  ): number;
}
```

### Document Service ✅

#### [NEW] [document.service.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/services/document.service.ts)

```typescript
export class DocumentService {
  /**
   * Generate DOCX dari template dan data debitur
   */
  static async generateDocx(
    templatePath: string,
    data: DebiturData
  ): Promise<Buffer>;

  /**
   * Format tanggal ke format Indonesia
   * YYYY-MM-DD -> DD NamaBulan YYYY
   */
  static formatDateIndonesian(dateStr: string): string;

  /**
   * Format angka ke format Rupiah
   * 1000000 -> 1.000.000
   */
  static formatCurrency(value: number): string;

  /**
   * Prepare context untuk template
   * - Format tanggal
   * - Format nominal
   * - Hitung RPC/DSR
   */
  static prepareTemplateContext(
    debitur: Debitur
  ): Record<string, any>;
}
```

---

## 🔐 Authentication

### NextAuth Configuration ✅

#### [NEW] [auth.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/lib/auth.ts)

```typescript
// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validate against database
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user info to session
    },
    async jwt({ token, user }) {
      // Add user info to token
    }
  }
};
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Login                            │
│               POST /api/auth/signin                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Validate       │
         │ Credentials    │
         └───────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐      ┌──────────────┐
   │  FAIL   │      │    SUCCESS   │
   └────┬────┘      └──────┬───────┘
        │                  │
        ▼                  ▼
   ┌─────────────┐   ┌─────────────┐
   │ Return 401  │   │  Create JWT │
   │ Unauthorized│   │   Session   │
   └─────────────┘   └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Redirect   │
                    │ to Dashboard│
                    └─────────────┘
```

---

## 🛡️ Middleware

#### [NEW] [middleware.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/middleware.ts)

```typescript
export function middleware(request: NextRequest) {
  // Protected routes
  const protectedPaths = ['/dashboard', '/api/debitur', '/api/template'];
  
  // Check authentication
  // Redirect to login if not authenticated
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};
```

**Features:**
- ✅ JWT-based authentication check
- ✅ Protected routes redirect to `/login`
- ✅ API endpoints return 401 if unauthorized
- ✅ Role-based access control (ADMIN/USER)

---

## 📦 Data Migration

### Dari SQLite ke PostgreSQL

```typescript
// prisma/seed.ts
async function migrateFromSQLite() {
  // 1. Connect ke SQLite lama
  // 2. Read semua data Debitur
  // 3. Transform data ke schema baru
  // 4. Insert ke PostgreSQL
  // 5. Verify data count
}
```

**Mapping Field:**

| SQLite (Lama) | PostgreSQL (Baru) |
|---------------|-------------------|
| `id` (Integer) | `id` (cuid) |
| `nama_pemohon` | `namaPemohon` |
| `no_ktp` | `noKtp` |
| `kategori` (string) | `kategori` (enum) |
| `data_lengkap` (JSON string) | `dataLengkap` (Json) |
| `tanggal_input` | `createdAt` |

---

## 📋 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "noKtp", "message": "NIK harus 16 digit" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `DSR_EXCEEDED` | 422 | DSR melebihi 90% |
| `INTERNAL_ERROR` | 500 | Server error |

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kredit_konsumer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# App
NODE_ENV="development"
```

---

## ✅ Verification Checklist

- [x] Database connection berhasil
- [x] CRUD debitur berfungsi
- [x] Pagination dan filtering berfungsi
- [x] PMT calculation akurat
- [x] DSR calculation akurat
- [x] DSR validation (hard block > 90%)
- [x] DOCX generation berhasil
- [x] Template upload berhasil
- [ ] Kelengkapan file template (3/4)
- [x] Authentication berfungsi
- [x] Protected routes aman
- [x] Error handling konsisten

---

## 🚀 Implementation Order

1. **Setup Database** - Prisma + PostgreSQL
2. **Authentication** - NextAuth.js
3. **Debitur CRUD** - API endpoints
4. **Calculation APIs** - PMT, DSR
5. **Document Generation** - DOCX
6. **Template Management** - Upload/download
7. **Data Migration** - SQLite → PostgreSQL
8. **Testing** - Unit tests, integration tests

---

## 📋 Next Steps (Frontend Integration)

1. Connect form submission to API endpoints
2. Implement authentication with NextAuth.js
3. Connect DOCX generation service
4. Implement real database operations with Prisma
5. Add file upload for templates
6. Implement search/filter API calls

---

## 📋 Recent Changes (27 Desember 2024)

### Document Updates
- ✅ Updated format to match `frontend_implementation_plan.md`
- ✅ Added Implementation Summary table
- ✅ Added status indicators for all components
- ✅ Added emoji section headers
- ✅ Added Last Updated and Status header
- ✅ Updated Next.js version to 16.x for consistency with frontend
- ✅ Added Authentication Flow diagram
- ✅ Improved overall document structure
