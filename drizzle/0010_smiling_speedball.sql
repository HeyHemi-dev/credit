ALTER TABLE "suppliers" ADD COLUMN "regions_served" "region"[] DEFAULT '{}'::region[] NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "services" "service"[] DEFAULT '{}'::service[] NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "website" text;--> statement-breakpoint
CREATE INDEX "suppliers_region_idx" ON "suppliers" USING btree ("region");