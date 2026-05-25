ALTER TYPE "public"."supplier_claim_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_claimed_by_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "supplier_claims_supplier_id_unique";--> statement-breakpoint
DROP INDEX "supplier_claims_user_id_unique";--> statement-breakpoint
DROP INDEX "suppliers_claimed_by_user_id_unique";--> statement-breakpoint
UPDATE "supplier_claims" AS "claim"
SET "status" = 'archived',
    "updated_at" = NOW()
FROM "suppliers" AS "supplier"
WHERE "supplier"."claimed_by_user_id" IS NOT NULL
  AND "claim"."status" IN ('pending', 'approved')
  AND (
    (
      "claim"."supplier_id" = "supplier"."id"
      AND "claim"."user_id" <> "supplier"."claimed_by_user_id"
    )
    OR (
      "claim"."user_id" = "supplier"."claimed_by_user_id"
      AND "claim"."supplier_id" <> "supplier"."id"
    )
  );--> statement-breakpoint
UPDATE "supplier_claims" AS "claim"
SET "status" = 'approved',
    "updated_at" = NOW()
FROM "suppliers" AS "supplier"
WHERE "supplier"."claimed_by_user_id" IS NOT NULL
  AND "claim"."supplier_id" = "supplier"."id"
  AND "claim"."user_id" = "supplier"."claimed_by_user_id"
  AND "claim"."status" <> 'approved';--> statement-breakpoint
INSERT INTO "supplier_claims" (
  "id",
  "supplier_id",
  "user_id",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  "supplier"."id",
  "supplier"."claimed_by_user_id",
  'approved',
  NOW(),
  NOW()
FROM "suppliers" AS "supplier"
LEFT JOIN "supplier_claims" AS "claim"
  ON "claim"."supplier_id" = "supplier"."id"
  AND "claim"."user_id" = "supplier"."claimed_by_user_id"
  AND "claim"."status" = 'approved'
WHERE "supplier"."claimed_by_user_id" IS NOT NULL
  AND "claim"."id" IS NULL;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "suppliers" AS "supplier"
    WHERE "supplier"."claimed_by_user_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM "supplier_claims" AS "claim"
        WHERE "claim"."supplier_id" = "supplier"."id"
          AND "claim"."user_id" = "supplier"."claimed_by_user_id"
          AND "claim"."status" = 'approved'
      )
  ) THEN
    RAISE EXCEPTION 'Backfill failed: missing approved supplier claim for an existing supplier owner';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "supplier_claims"
    WHERE "status" IN ('pending', 'approved')
    GROUP BY "supplier_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Backfill failed: more than one active supplier claim exists for a supplier';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "supplier_claims"
    WHERE "status" IN ('pending', 'approved')
    GROUP BY "user_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Backfill failed: more than one active supplier claim exists for a user';
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_claims_active_supplier_id_unique" ON "supplier_claims" USING btree ("supplier_id") WHERE "supplier_claims"."status" in ('pending', 'approved');--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_claims_active_user_id_unique" ON "supplier_claims" USING btree ("user_id") WHERE "supplier_claims"."status" in ('pending', 'approved');--> statement-breakpoint
CREATE INDEX "supplier_claims_supplier_id_idx" ON "supplier_claims" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_claims_user_id_idx" ON "supplier_claims" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "claimed_by_user_id";
