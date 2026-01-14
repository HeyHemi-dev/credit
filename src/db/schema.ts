import {
  boolean,
  date,
  foreignKey,
  index,
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

import { sql } from 'drizzle-orm'
import { REGION, SERVICE } from '@/lib/constants'

// Enum for service types
// Using SERVICE object directly (pgEnum accepts Record<string, string>)
export const serviceEnum = pgEnum('service', SERVICE)

// Enum for region types
export const regionEnum = pgEnum('region', REGION)

// Suppliers table
export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    instagramHandle: text('instagram_handle'),
    tiktokHandle: text('tiktok_handle'),
    region: regionEnum('region'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('suppliers_email_idx').on(table.email),
    index('suppliers_instagram_handle_idx').on(table.instagramHandle),
    index('suppliers_tiktok_handle_idx').on(table.tiktokHandle),
  ],
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
  (table) => [primaryKey({ columns: [table.eventId, table.supplierId] })],
)

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
