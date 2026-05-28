import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { getTableColumns, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  ACTIVE_SUPPLIER_CLAIM_STATUSES,
  REGION,
  SERVICE,
  SUPPLIER_CLAIM_STATUS,
} from '@/lib/constants'

export function lower(column: AnyPgColumn) {
  return sql`lower(${column})`
}

// Enum for service types
// Using SERVICE object directly (pgEnum accepts Record<string, string>)
export const serviceEnum = pgEnum('service', SERVICE)

// Enum for region types
export const regionEnum = pgEnum('region', REGION)
export const supplierClaimStatusEnum = pgEnum(
  'supplier_claim_status',
  SUPPLIER_CLAIM_STATUS,
)

// Suppliers table
export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailDomain: text('email_domain').generatedAlwaysAs(
      sql`split_part(email, '@', 2)`,
    ),
    // Primary home region for the supplier's business.
    region: regionEnum('region'),
    // Regions this supplier is willing to work or travel in.
    regionsServed: regionEnum('regions_served')
      .array()
      .notNull()
      .default(sql`'{}'::region[]`),
    // Services this supplier offers.
    services: serviceEnum('services')
      .array()
      .notNull()
      .default(sql`'{}'::service[]`),
    website: text('website'),
    instagramHandle: text('instagram_handle'),
    tiktokHandle: text('tiktok_handle'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('suppliers_email_unique').on(lower(table.email)),
    index('suppliers_email_domain_idx').on(table.emailDomain),
    index('suppliers_region_idx').on(table.region),
    index('suppliers_instagram_handle_idx').on(table.instagramHandle),
    index('suppliers_tiktok_handle_idx').on(table.tiktokHandle),
  ],
)
export const supplierColumns = getTableColumns(suppliers)

export const supplierClaims = pgTable(
  'supplier_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => userInNeonAuth.id, { onDelete: 'cascade' }),
    // Claim lifecycle and current ownership are derived from this status.
    status: supplierClaimStatusEnum('status')
      .notNull()
      .default(SUPPLIER_CLAIM_STATUS.PENDING),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('supplier_claims_active_supplier_id_unique')
      .on(table.supplierId)
      .where(sql`${table.status} in ${sql.raw(
        `(${ACTIVE_SUPPLIER_CLAIM_STATUSES.map((status) => `'${status}'`).join(', ')})`,
      )}`),
    uniqueIndex('supplier_claims_active_user_id_unique')
      .on(table.userId)
      .where(sql`${table.status} in ${sql.raw(
        `(${ACTIVE_SUPPLIER_CLAIM_STATUSES.map((status) => `'${status}'`).join(', ')})`,
      )}`),
    index('supplier_claims_supplier_id_idx').on(table.supplierId),
    index('supplier_claims_user_id_idx').on(table.userId),
    index('supplier_claims_status_idx').on(table.status),
  ],
)
export const supplierClaimColumns = getTableColumns(supplierClaims)

export const supplierClaimVerifications = pgTable(
  'supplier_claim_verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    supplierClaimId: uuid('supplier_claim_id')
      .notNull()
      .references(() => supplierClaims.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    consumedAt: timestamp('consumed_at'),
    attemptCount: integer('attempt_count').notNull().default(0),
    lastSentAt: timestamp('last_sent_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('supplier_claim_verifications_supplier_claim_id_unique').on(
      table.supplierClaimId,
    ),
    index('supplier_claim_verifications_expires_at_idx').on(table.expiresAt),
  ],
)
export const supplierClaimVerificationColumns = getTableColumns(
  supplierClaimVerifications,
)

// Events table
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => userInNeonAuth.id, { onDelete: 'cascade' }),
    eventName: text('event_name').notNull(),
    weddingDate: date('wedding_date').notNull(),
    region: regionEnum('region'),
    shareToken: text('share_token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('events_created_by_user_id_idx').on(table.createdByUserId)],
)
export const eventColumns = getTableColumns(events)

// Event suppliers junction table
export const eventSuppliers = pgTable(
  'event_suppliers',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    service: serviceEnum('service').notNull(),
    contributionNotes: text('contribution_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.supplierId, table.service] }),
  ],
)
export const eventSupplierColumns = getTableColumns(eventSuppliers)

// ===================================================
// Neon Auth schema - for reference only
// ===================================================

export const neonAuth = pgSchema('neon_auth')

export const userInNeonAuth = neonAuth.table(
  'user',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [unique('user_email_key').on(table.email)],
)

export const sessionInNeonAuth = neonAuth.table(
  'session',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: uuid().notNull(),
    impersonatedBy: text(),
    activeOrganizationId: text(),
  },
  (table) => [
    index('session_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: 'session_userId_fkey',
    }).onDelete('cascade'),
    unique('session_token_key').on(table.token),
  ],
)

export const accountInNeonAuth = neonAuth.table(
  'account',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: uuid().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => [
    index('account_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: 'account_userId_fkey',
    }).onDelete('cascade'),
  ],
)

export const verificationInNeonAuth = neonAuth.table(
  'verification',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('verification_identifier_idx').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const jwksInNeonAuth = neonAuth.table('jwks', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  expiresAt: timestamp({ withTimezone: true, mode: 'string' }),
})

export const organizationInNeonAuth = neonAuth.table(
  'organization',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    metadata: text(),
  },
  (table) => [
    uniqueIndex('organization_slug_uidx').using(
      'btree',
      table.slug.asc().nullsLast().op('text_ops'),
    ),
    unique('organization_slug_key').on(table.slug),
  ],
)

export const memberInNeonAuth = neonAuth.table(
  'member',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: uuid().notNull(),
    userId: uuid().notNull(),
    role: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => [
    index('member_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops'),
    ),
    index('member_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationInNeonAuth.id],
      name: 'member_organizationId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: 'member_userId_fkey',
    }).onDelete('cascade'),
  ],
)

export const invitationInNeonAuth = neonAuth.table(
  'invitation',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: uuid().notNull(),
    email: text().notNull(),
    role: text(),
    status: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    inviterId: uuid().notNull(),
  },
  (table) => [
    index('invitation_email_idx').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    index('invitation_organizationId_idx').using(
      'btree',
      table.organizationId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationInNeonAuth.id],
      name: 'invitation_organizationId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [userInNeonAuth.id],
      name: 'invitation_inviterId_fkey',
    }).onDelete('cascade'),
  ],
)

export const projectConfigInNeonAuth = neonAuth.table(
  'project_config',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    endpointId: text('endpoint_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    trustedOrigins: jsonb('trusted_origins').notNull(),
    socialProviders: jsonb('social_providers').notNull(),
    emailProvider: jsonb('email_provider'),
    emailAndPassword: jsonb('email_and_password'),
    allowLocalhost: boolean('allow_localhost').notNull(),
  },
  (table) => [unique('project_config_endpoint_id_key').on(table.endpointId)],
)
