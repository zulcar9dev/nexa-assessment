# Backend Implementation Plan
## Aplikasi Kredit Konsumer BNI

---

## Tech Stack Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js API Routes | 14.x | REST API endpoints |
| Prisma | 5.x | ORM & database toolkit |
| PostgreSQL | 15.x | Database utama |
| NextAuth.js | 4.x | Authentication |
| Zod | 3.x | Request validation |
| bcryptjs | Latest | Password hashing |
| docx | 8.x | Generate DOCX documents |

---

## Struktur Folder Backend

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts        # NextAuth handler
│       ├── debitur/
│       │   ├── route.ts            # GET all, POST create
│       │   └── [id]/
│       │       ├── route.ts        # GET one, PUT, DELETE
│       │       └── download/
│       │           └── route.ts    # Generate DOCX
│       ├── calculate/
│       │   ├── pmt/
│       │   │   └── route.ts        # Calculate PMT
│       │   └── dsr/
│       │       └── route.ts        # Calculate DSR
│       └── template/
│           └── route.ts            # GET all, POST upload
├── services/
│   ├── debitur.service.ts
│   ├── calculation.service.ts
│   ├── document.service.ts
│   └── template.service.ts
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # Utility functions
└── types/
    └── api.ts                      # API types
prisma/
├── schema.prisma
└── seed.ts                         # Database seeding
templates/
├── template_prapurna_reguler.docx
├── template_prapurna_takeover.docx
├── template_purna_reguler.docx
└── template_purna_takeover.docx
```

---

## Proposed Changes

### Database Schema

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

### API Endpoints

#### Debitur CRUD

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/route.ts)

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

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/[id]/route.ts)

**GET /api/debitur/[id]** - Get detail debitur

**PUT /api/debitur/[id]** - Update debitur

**DELETE /api/debitur/[id]** - Hapus debitur

---

#### Calculation APIs

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/calculate/pmt/route.ts)

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

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/calculate/dsr/route.ts)

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

#### Document Generation

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/debitur/[id]/download/route.ts)

**GET /api/debitur/[id]/download** - Generate dan download DOCX

```typescript
// Response: File stream .docx
// Headers:
// Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
// Content-Disposition: attachment; filename="Kredit_[NamaDebitur]_[NIK].docx"
```

---

#### Template Management

##### [NEW] [route.ts](file:///c:/Users/zulka/Documents/01.%20PROJECT/app_kredit_konsumer_bni/src/app/api/template/route.ts)

**GET /api/template** - List semua template

**POST /api/template** - Upload template baru (multipart/form-data)

---

### Business Logic Services

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

### Authentication

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

---

### Middleware

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

---

## Data Migration

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

## API Response Format

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

## Environment Variables

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

## Verification Checklist

- [ ] Database connection berhasil
- [ ] CRUD debitur berfungsi
- [ ] Pagination dan filtering berfungsi
- [ ] PMT calculation akurat
- [ ] DSR calculation akurat
- [ ] DSR validation (hard block > 90%)
- [ ] DOCX generation berhasil
- [ ] Template upload berhasil
- [ ] Authentication berfungsi
- [ ] Protected routes aman
- [ ] Error handling konsisten

---

## Implementation Order

1. **Setup Database** - Prisma + PostgreSQL
2. **Authentication** - NextAuth.js
3. **Debitur CRUD** - API endpoints
4. **Calculation APIs** - PMT, DSR
5. **Document Generation** - DOCX
6. **Template Management** - Upload/download
7. **Data Migration** - SQLite → PostgreSQL
8. **Testing** - Unit tests, integration tests
