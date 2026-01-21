ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_email_unique";--> statement-breakpoint
DROP INDEX "suppliers_email_idx";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "email_domain" text GENERATED ALWAYS AS (split_part(email, '@', 2)) STORED;--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_email_unique" ON "suppliers" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "suppliers_email_domain_idx" ON "suppliers" USING btree ("email_domain");