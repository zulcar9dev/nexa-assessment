import { pgTable, text, timestamp, boolean, index, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============ USER & AUTH (Better Auth Required) ============
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role").$type<'ADMIN' | 'USER'>().default('USER').notNull(),
  username: text("employee_id").unique(),
  password: text("password"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ============ DEBITUR ============
export const client = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),
    applicantName: text("nama_pemohon").notNull(),
    idNumber: text("no_ktp").notNull(),
    kategori: text("kategori").$type<'PRAPURNA' | 'PURNA' | 'AKTIF'>().notNull(),
    jenisPengajuan: text("jenis_pengajuan").$type<'BARU' | 'TOP_UP' | 'TOP_UP_SISA_GAJI' | 'TAKEOVER' | 'THT' | 'FLEKSI_AKTIF' | 'PENSIUNAN_JANDA_BARU' | 'PENSIUNAN_JANDA_TOP_UP' | 'PENSIUNAN_JANDA_TAKEOVER' | 'PENSIUNAN_DUDA_BARU' | 'PENSIUNAN_DUDA_TOP_UP' | 'PENSIUNAN_DUDA_TAKEOVER'>().default('BARU').notNull(),
    segmentasi: text("segmentasi").$type<'TASPEN' | 'ASABRI' | 'BUMD_BUMN' | 'SWASTA' | 'PEMERINTAHAN'>().default('TASPEN').notNull(),
    dataLengkap: jsonb("data_lengkap").notNull(),
    recommendations: jsonb("recommendations"),
    retirementPlan: text("retirement_plan"),
    pensionBenefits: text("pension_benefits"),
    healthConditions: text("health_conditions"),
    medications: text("medications"),
    exerciseFrequency: text("exercise_frequency"),
    socialActivities: text("social_activities"),
    communityInvolvement: text("community_involvement"),
    status: text("status").$type<'DRAFT' | 'SUBMITTED'>().default('SUBMITTED').notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("debitur_nama_pemohon_idx").on(table.applicantName),
    index("debitur_no_ktp_idx").on(table.idNumber),
    index("debitur_kategori_idx").on(table.kategori),
    index("debitur_user_id_idx").on(table.userId),
    uniqueIndex("debitur_ktp_jenis_submitted_unique")
      .on(table.idNumber, table.jenisPengajuan)
      .where(sql`status = 'SUBMITTED'`),
  ],
);

// ============ TEMPLATE ============
export const template = pgTable(
  "templates",
  {
    id: text("id").primaryKey(),
    kategori: text("kategori").$type<'PRAPURNA' | 'PURNA' | 'AKTIF'>().unique().notNull(),
    name: text("name").notNull(),
    filename: text("filename").notNull(),
    path: text("path").notNull(),
    fileData: text("file_data"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

// ============ APP SETTINGS ============
export const appSettings = pgTable("app_settings", {
  id: text("id").primaryKey(),
  slikMitigasiRiskText: text("slik_mitigasi_risk_text").notNull(),
  catatanProgramPricing: text("catatan_program_pricing").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============ KNOWLEDGE BASE DOCUMENT ============
export const document = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    judul: text("judul").notNull(),
    nomorMemo: text("nomor_memo").notNull(),
    kategori: text("kategori").$type<'KREDIT_FLEKSI' | 'KREDIT_GRIYA' | 'KREDIT_PENSIUN'>().notNull(),
    targetMarket: text("target_market").$type<'ASN' | 'SWASTA' | 'TASPEN' | 'ASABRI' | 'WIRASWASTA'>().notNull(),
    status: text("status").$type<'AKTIF' | 'SEGERA_BERAKHIR' | 'EXPIRED' | 'ARCHIVED'>().default('AKTIF').notNull(),
    berlakuMulai: timestamp("berlaku_mulai").notNull(),
    berlakuAkhir: timestamp("berlaku_akhir").notNull(),
    keywords: text("keywords").array().notNull(),
    filename: text("filename").notNull(),
    filepath: text("filepath").notNull(),
    filesize: integer("filesize").notNull(),
    version: integer("version").default(1).notNull(),
    replacedById: text("replaced_by_id"),
    uploadedById: text("uploaded_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("document_judul_idx").on(table.judul),
    index("document_nomor_memo_idx").on(table.nomorMemo),
    index("document_kategori_idx").on(table.kategori),
    index("document_status_idx").on(table.status),
    index("document_target_market_idx").on(table.targetMarket),
    index("document_berlaku_akhir_idx").on(table.berlakuAkhir),
    index("document_uploaded_by_id_idx").on(table.uploadedById),
  ],
);

// ============ RELATIONS ============
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  clients: many(client),
  documents: many(document),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const clientRelations = relations(client, ({ one }) => ({
  user: one(user, {
    fields: [client.userId],
    references: [user.id],
  }),
}));

export const documentRelations = relations(document, ({ one, many }) => ({
  uploadedBy: one(user, {
    fields: [document.uploadedById],
    references: [user.id],
  }),
  replacedBy: one(document, {
    fields: [document.replacedById],
    references: [document.id],
    relationName: "documentVersions",
  }),
  replaces: many(document, {
    relationName: "documentVersions",
  }),
}));
