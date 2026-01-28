# Project context (read first)

You’re designing wireframes for a **mobile-first web app** for the **wedding industry**, primarily used by **wedding photographers**.

**Core problem**
Photographers want to tag wedding suppliers accurately on Instagram and via email, but supplier details are scattered, incomplete, and manually collected.

**Product promise (MVP)**

> _Send one link. Get wedding supplier tags back — copy-ready and formatted for Instagram._

Think:

- Typeform-style data collection for couples
- Utility-first, minimal UX

# Global constraints

- **Mobile-first** (mobile web, not native)
- Two completely separate experiences:
  - **Event management view (authenticated users/suppliers)**
  - **Couple view (private link, no auth)**

- Never show auth, avatar, or navigation UI in the couple view
- Autosave everywhere
- No submit step
- NZ-only (regions optional)

# Event Management View (Authenticated)

This flow has **one primary navigation (Events list)** plus **drawer-based secondary views**.

It is used by suppliers (usually wedding photographers) to create and management events in order to gather supplier tags from couples.

## Auth & navigation

- Google OAuth sign-in
- Avatar menu only:
  - Sign out

- No settings screen
- Default screen = Events list
- **Single primary action only**:
  - Floating bottom button: **New event**

- No tab bar, no secondary navigation

## Photographer flow

### Events list (home)

**This is a full navigation view (root).**

Each event row shows:

- Couple name
- Wedding date
- Supplier count / completion hint
- **Share to couple icon/button**:
  - Copies the private couple link instantly
  - Does **not** open the event

Global UI:

- Floating **New event** button
- Empty state explains value + prompts first event

### Create new event (drawer)

**This is not a new navigation screen.**
It opens as a **bottom drawer** over the Events list.

Fields:

- Couple name (required)
- Wedding date (required)
- Wedding region (optional, NZ only)

Primary action:

- “Create event”
- Cancel (x)

On success:

- Event is created immediately
- Drawer transitions to show:
  - Private link
  - Clear copy-link action

### Event detail (drawer)

**This is not a new navigation screen.**
Tapping an event opens a **full-height bottom drawer**.

Contents:

- Supplier list grouped by **service**
- Ordering exactly matches output order
- Each supplier row shows:
  - Name
  - Service
  - Presence/absence of IG/TikTok (icon or hint)

- Subtle non-blocking indicators for missing info

**Outputs (inline, not separate screen):**

- Buttons:
  - Copy for Instagram
  - Copy email list

- Read-only preview of generated output
- Missing handles fall back to supplier name

**Danger zone (bottom of drawer):**

- Delete event action
- Requires confirmation modal

# Couple View (Private Link, No Login)

This flow has **two navigation views (supplier list + create new supplier)** with **multiple UI states**. It is used by couples to list the suppliers they used for their wedding so they can be eaily tagged.

**Critical rule:**
No navigation chrome. No auth UI. No account language.

## Couple flow

### Intro / explanation (modal above supplier list)

**This is a modal/drawer, not a separate screen.**

- Shown as a dismissible popup/modal/drawer on first load
- Explains:
  - Why supplier info is needed
  - That this helps tagging & thank-yous

- Reassurance:
  - No login required
  - Can come back anytime
  - Progress auto-saves

- CTA: “Start adding suppliers”

### Supplier list + search (main view)

**This is a full navigation view for couples.**

All changed to this layout are autosaved

Layout:

- Ephemeral autosave banner - if can't save (invalid state) the banner doesn't disappear and turns red "Not saved - missing field"
- **Prominent search field above the fold**
- Below: list of suppliers already added

Supplier list rows show:

- Supplier name
- Service (required select field - if this is left unfilled when trying to autosave, give red outline.)
- Subtle missing-info nudges (non-blocking) e.g. "Add info for this supplier: Instagram handle | Tiktok handle"
- Delete/remove supplier in three dot menu

Primary action:

- Search first
- Complete supplier list fields

### **Search (active)**

**This is a combo-box/modal of the open search field.**

Layout:

- Live results while typing
- Results show:
  - Supplier name

  - Optional location

  - Optional email

Actions:

- Select existing supplier from list

- Or **Create a new supplier**

### Create a new supplier

**Full navigation view.**
This should feel heavier and more intentional.

Language:

- “Create a new supplier”
- Reinforce this creates a new business entry

Fields:

- Supplier name (required text field)
- Email (required text field)
- Service (required select)
- Instagram handle (optional text field '@')
- TikTok handle (optional text field '@')
- Location/region (optional select, prefilled)

Before creation:

- **“Did you mean one of these?”** duplicate-check state
- Options:
  - Select an existing supplier
  - Confirm creation of new supplier

### Non-blocking nudges (everywhere)

- Non-blocking prompts for missing handles
- Always skippable
- Never prevent progress

## UX principles

- Mobile-first, thumb-friendly
- Drawers > full navigation changes
- Minimal chrome, maximum focus
- Calm, professional, practical
- Designed for busy, distracted users

## Out of scope (do not design)

- Supplier accounts or claiming
- Payments or pricing
- Notifications/reminders
- Advanced admin or dedupe tools

- Non-NZ regions
