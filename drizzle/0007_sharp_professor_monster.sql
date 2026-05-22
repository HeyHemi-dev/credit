CREATE TABLE "supplier_claim_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_claim_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supplier_claim_verifications" ADD CONSTRAINT "supplier_claim_verifications_supplier_claim_id_supplier_claims_id_fk" FOREIGN KEY ("supplier_claim_id") REFERENCES "public"."supplier_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_claim_verifications_supplier_claim_id_unique" ON "supplier_claim_verifications" USING btree ("supplier_claim_id");--> statement-breakpoint
CREATE INDEX "supplier_claim_verifications_expires_at_idx" ON "supplier_claim_verifications" USING btree ("expires_at");