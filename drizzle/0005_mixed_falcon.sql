DROP INDEX "event_suppliers_event_supplier_service_unique";--> statement-breakpoint
ALTER TABLE "event_suppliers" DROP CONSTRAINT "event_suppliers_event_id_supplier_id_pk";--> statement-breakpoint
ALTER TABLE "event_suppliers" ADD CONSTRAINT "event_suppliers_event_id_supplier_id_service_pk" PRIMARY KEY("event_id","supplier_id","service");