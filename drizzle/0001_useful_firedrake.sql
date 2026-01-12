ALTER TABLE "event_suppliers" DROP CONSTRAINT "event_suppliers_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "event_suppliers" DROP CONSTRAINT "event_suppliers_supplier_id_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_suppliers" ADD CONSTRAINT "event_suppliers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_suppliers" ADD CONSTRAINT "event_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_created_by_user_id_idx" ON "events" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "suppliers_email_idx" ON "suppliers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "suppliers_instagram_handle_idx" ON "suppliers" USING btree ("instagram_handle");--> statement-breakpoint
CREATE INDEX "suppliers_tiktok_handle_idx" ON "suppliers" USING btree ("tiktok_handle");