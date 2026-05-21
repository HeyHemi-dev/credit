# To-Do

## Directory / Profiles

- [x] Define directory/profile MVP (public profile fields, URL/slug strategy, rating model, what's free vs paid)
- [x] Decide model: 1 user -> 1 supplier, or 1 user -> many suppliers
  - [x] One to many requires UI for switching between suppliers
  - decision recorded in `documentation/with-thanks_directory-profile-mvp.md`
- [x] Set up email service for transactional emails (Resend? Loops?)
- [ ] Supplier dedupe/merge workflow (avoid duplicate profiles splitting ratings) - manual; contact support, admin interface?
- [ ] Allow suppliers to claim profiles (end-to-end)
- [ ] Add supplier claim flow: search/select supplier to claim
- [ ] Claim verification: auto-claim when Google login email matches supplier email; otherwise email supplier to confirm
- [ ] Allow editing supplier profile (claimed suppliers only)
- [ ] Make public supplier profile pages
- [ ] Make public directory pages (browse/search/sort/paginate)
- [ ] Add filtering for suppliers by service and region
- [ ] Make profile pages SEO friendly
- [ ] Enable supplier ratings with authenticated raters (low-friction for couples; abuse-resistant)
- [ ] Add rating moderation/reporting (supplier can flag; admin can review/remove)
- [ ] Email suppliers when they are tagged in events
- [ ] Show "Tagged in" events on supplier screen; distinguish owned events vs tagged/shared
- [ ] Define paid profile offering (tiers + what suppliers get)
- [ ] Integrate payments so suppliers can pay for their profile

## Other

- [ ] Allow user to generate API token
- [ ] Allow archiving old events
- [ ] Allow couples to mark event as complete
- [ ] Dedupe events on create (event name/date/region; consider a match when 2 of 3 are similar)
- [ ] Look into why dedupe create supplier shows unrelated Gmail addresses
- [x] Redirect users into the app automatically after login (likely to `/events`)
- [ ] Add checkbox-style tag selection for copying: client-side only, allow copying a formatted subset of tags
- [ ] Handle auth in middleware: add `src/start.ts` request middleware to attach Better Auth session/user to server context; refactor serverFns to rely on context (don’t pass session tokens from client) and enforce auth on supplier search/dedupe + other protected serverFns
- [x] Update worktree workflow script output to show active branches count (e.g. "x/10 DB branches used.")
- [x] Update auth settings pages to use Better Auth components
- [ ] Use route loaders for performance (preload data) and to set/update the document title
- [ ] Investigate Vite/Rollup large chunk build warning and identify bundle-splitting opportunities
