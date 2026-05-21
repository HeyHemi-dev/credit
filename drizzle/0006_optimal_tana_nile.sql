CREATE TYPE "public"."supplier_claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "supplier_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "supplier_claim_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "claimed_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "supplier_claims" ADD CONSTRAINT "supplier_claims_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_claims" ADD CONSTRAINT "supplier_claims_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_claims_supplier_id_unique" ON "supplier_claims" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_claims_user_id_unique" ON "supplier_claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "supplier_claims_status_idx" ON "supplier_claims" USING btree ("status");--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "neon_auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_claimed_by_user_id_unique" ON "suppliers" USING btree ("claimed_by_user_id");