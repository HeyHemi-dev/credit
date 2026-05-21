# Supplier Claim Verification MVP

## Decision

For MVP, supplier claim verification will use:

- **auto-approve** when the signed-in Google account email matches the supplier email exactly
- otherwise, a **one-time verification code** sent to the supplier email address
- the code is entered **on the settings page** by the currently signed-in user

We are **not** using an email magic-link flow for MVP.

## Why

This keeps the claim flow simpler and safer in the current app shape.

### Reasons for choosing one-time code over magic link

- the claim UI already lives inside account settings, so code entry fits naturally
- it avoids redirect complexity across sign-in and cross-device flows
- it avoids accidental verification when someone opens the email while signed in to the wrong account
- it keeps verification tied to the logged-in claimant account instead of relying on link state
- it is easier to explain in the UI: "We emailed a code to your supplier email"

### Tradeoff accepted

- code entry is a little more manual than clicking a link
- cross-device flows are slightly less convenient because the user may need to move the code from one device to another

For MVP, this tradeoff is acceptable because it removes a lot of auth and redirect edge cases.

## Intended flow

### 1. User starts a claim

- signed-in user selects a supplier from settings
- app creates or updates a `supplier_claims` row with status `pending`

### 2. Auto-approve when Google email matches

- if the signed-in account email exactly matches the supplier email
- approve the claim immediately
- set `suppliers.claimed_by_user_id`
- mark the claim as approved
- no email code is needed in this case

This auto-approve path should remain part of MVP.

### 3. Email code verification when emails do not match

- generate a short-lived one-time code for the pending claim
- send the code to the supplier email address using Resend
- user enters the code on the settings page
- server verifies the code against the currently signed-in user's pending claim
- if valid, approve the claim and set `suppliers.claimed_by_user_id`

## Security and ownership rules

The code must **not** be enough on its own.

Verification must require:

- a valid signed-in session
- the code matching the current user's pending claim
- the code being unexpired
- the code not being consumed already

This prevents the wrong signed-in account from verifying a claim even if they can see the email code.

## Suggested MVP behavior

### Code characteristics

- use a short numeric code, e.g. 6 digits
- store only a **hash** of the code in the database
- one-time use only

### Expiry and retry policy

- code expiry: **10 minutes**
- resend cooldown: **30 to 60 seconds**
- max failed attempts before forcing resend: **5**

Do **not** use a 1-minute expiry for MVP. It is too short for normal inbox delays and device switching.

## Suggested data shape

Keep claim ownership separate from verification attempts.

Existing:

- `supplier_claims`

Suggested new table for verification:

- `supplier_claim_verifications`
  - `id`
  - `supplierClaimId`
  - `codeHash`
  - `expiresAt`
  - `consumedAt`
  - `attemptCount`
  - `lastSentAt`
  - `createdAt`
  - `updatedAt`

Notes:

- at most one active verification record per pending claim is enough for MVP
- resending can rotate the code and update the same row
- once approved, verification records should no longer be usable

## UI expectations

On the settings page, pending claims should support:

- showing that the claim is pending
- sending or resending a verification code
- entering the code inline
- confirming success inline
- cancelling the pending claim

Helpful messages:

- "We sent a code to `supplier@email.com`"
- "Enter the 6-digit code to verify this claim"
- "This code has expired. Request a new one."
- "Too many incorrect attempts. Request a new code."

## Edge cases

### User checks email on another device

- still works because they can manually enter the code on the original device
- no special redirect handling is required

### User signs in with the wrong account

- code entry should fail because verification is tied to the signed-in user's pending claim
- the code must not approve a claim for a different account

### Supplier already claimed

- claim verification should fail safely if the supplier has been claimed before approval completes

### Pending claim changed to a different supplier

- invalidate the old verification code
- require a new code for the new supplier email

## Follow-up implementation order

1. Add cancel pending claim
2. Add verification-code table and server helpers
3. Add auto-approve when Google account email matches supplier email
4. Add send/resend code with Resend
5. Add inline code entry and verification on settings page
6. Add rate limiting / attempt limiting behavior
