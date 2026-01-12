import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  index,
  uuid,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core'

import { usersSync } from 'drizzle-orm/neon'
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
    id: uuid('id').primaryKey(),
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
    id: uuid('id').primaryKey(),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => usersSync.id),
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
      .references(() => events.id),
    supplierId: uuid('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    service: serviceEnum('service').notNull(),
    contributionNotes: text('contribution_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.supplierId] })],
)
