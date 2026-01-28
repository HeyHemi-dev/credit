# User flows

## Photographer creates event + sends link

- Trigger: Wedding is booked, pre-wedding questionnaire, or post-wedding turnaround.
- Steps:
  1. Sign in.
  2. Create new event.

     Enter couple name (single text field) + select wedding date (datepicker) + select wedding region (enum - optional)

  3. Copy private link (token?)
  4. Send link to couple (email/CRM template).
- Success: Link delivered with minimal friction (ideally < 60 seconds).
- Failure cases: photographer forgets, link buried, couple never receives.
- Edge cases:
  - Wedding region is not in NZ - for V1 just don’t allow this.

## Couple completes supplier details (no login)

- Trigger: Couple clicks the private link.
- Steps:
  1. See short explanation of why you need this (tags + thank you’s).
  2. Search for suppliers
     - Search by **name**, **email**, **IG handle**, **TikTok handle**. (debounce with Tanstack Pacer library)
     - Show name, location (?), and email in search results
     - `Add new supplier` button if supplier doesn’t exist
  3. Complete supplier details
     - Select service (enum - required)
     - Enter contribution notes (text-field - optional).
     - **If supplier is missing IG/TikTok:** show a subtle, non-blocking prompt the couple can click or ignore (similar UI-wise to the “forgot email?” hint on login forms):
       - “This supplier has missing info: Add Instagram handle, Add Tiktok handle…”
  4. Auto-saved (batch using Tanstack Pacer library)
- Success: Enough detail captured to produce “copy-ready” tags.
- Failure cases: couple abandons, doesn’t know handles/emails, typos.
- Edge cases:
  - Supplier not in DB - Add new supplier flow
  - Couple doesn’t fill out - Reminder email flow?
  - Adding friends as suppliers (e.g. “Aunty Mary made the cake”)

## Photographer reviews + copies IG-formatted tags

- Trigger: Couple submits (or photographer opens event anytime).
- Steps:
  1. Open event.
  - **If supplier is missing IG/TikTok:** show a subtle, non-blocking prompt the couple can click or ignore (similar UI-wise to the “forgot email?” hint on login forms):
    - “This supplier has missing info: Add Instagram handle, Add Tiktok handle…”
  1. Click one of the one-click buttons: `Copy for [email/ig/tiktok]`.
  2. Paste into destination app
- Success: tags paste cleanly with correct @handles and consistent ordering.
- Edge cases:
  - Missing @handles/data - List all supplier names, but just leave the handle blank.

## Add new supplier flow (couple)

Common at beginning, rare as time goes on; default path is **search + select existing supplier**.

- Trigger: Couple searches and can’t find the supplier.
- Steps:
  1. Couple clicks **Add new supplier**.
  2. Enter **supplier name** (required).
  3. Enter **email address** (**required**).
  4. Enter **Instagram handle** (optional).
  5. Enter **TikTok handle** (optional).
  6. Enter **location/region** (optional, pre-fill based on event region).
  7. Submit.
  8. System does a **“Did you mean one of these?”** check (support-form style) _before_ creating:
     - Uses name + region + handles.
     - Uses **email domain** similarity to suggest dupes (e.g. [hemi@patina.photo](mailto:hemi@patina.photo) vs [hello@patina.photo](mailto:hello@patina.photo)).
     - Couple can tap to select an existing supplier instead.
     - Or confirm: **“No, create new supplier”**.
  9. If creating new, system creates supplier as **unverified** and attaches it to the event.
- Success: Couple can keep moving without friction, and the event still gets copy-ready tags.
- Guardrails (so the DB gets cleaner over time):
  - Lightweight validation/normalisation: strip leading @, lowercase handle. Match IG and Tiktok handle rules.
  - **Pre-create dedupe prompt** (“Did you mean…?”) before allowing a new supplier.
  - If email/handle matches an existing supplier, require choosing the existing one (or an explicit override).
  - Rate limit creation per event to prevent spam.
- Edge cases:
  - Generic email inboxes (e.g. Gmail) reduce the usefulness of domain-based dedupe
  - couple doesn’t know the supplier email address when adding a new supplier.
  - Two different suppliers with same name
  - duplicate supplier data added: unique constraint on email address, no unique constraint on Name, IG, or Tiktok

# Additional Specs

### Supplier model

- A **supplier** is a **business/brand**.
- If a business has multiple brands, they are represented as **multiple suppliers**.

### “Usable tags” definition

- Minimum required for a supplier to be considered usable: **Name + Email** - enforced in suppliers table at DB level.
- Instagram/TikTok handles are optional.
- If handles are missing, output falls back to **supplier name** (no blocking).

### One-click outputs

**Instagram caption (multiline)**

- Output is multiline, one supplier per line.
- Ordered by **service enum order**, then **alphabetical** within each service.
- Format:
  - `[service] - @handle`
  - Fallback: `[service] - Supplier Name`

**Email list (single line)**

- Output is a single line of emails:
  - `[email], [email], [email]`

### Authentication (v1)

- **Photographers must sign in** to access the dashboard and to create/manage events.
- Sign-in method: **Google OAuth only** (no password auth).
- Couples **do not** sign in. They access the event via the private link.

### Link behaviour

- There is **no submission step**. The couple view is a stripped-down editing UI with autosave.
- The private link remains **editable forever** until the photographer explicitly locks the event.

### Supplier profile claiming (future)

### Out of scope (v1)

- Supplier profile claiming / supplier accounts.
- Advanced supplier dedupe tooling (manual merge UI, canonical supplier management). Dedupe is limited to UI hints at add-supplier time; e.g. search + “Did you mean…?” + unique email
- Submission/approval workflows (no “submit”, no reviews, no status gates).
- Advanced link security (expiry, view-only links, granular permissions).
- Regions outside of NZ.
- Supporting “couple doesn’t know supplier email” (future version).
- Additional output formats beyond **Instagram caption** + **email list** (e.g. blog templates, CSV export).
