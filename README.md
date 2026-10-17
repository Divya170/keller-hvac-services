# Keller HVAC Services — Website

A full-stack build of the Keller HVAC website prototype (Home, Air Conditioning, Heating, Installation & Repairs, About / Contact, Request Service, Privacy). The prototype's hash routes and localStorage "backend" are replaced by real pages, a real API and a database.

| Layer    | Tech                                  | Folder                |
| -------- | ------------------------------------- | --------------------- |
| Frontend | Next.js 15 (App Router, React 19, TS) | `frontend/`           |
| Backend  | NestJS 11 + TypeORM                   | `backend/`            |
| Database | SQLite3 (better-sqlite3)              | `database/app.sqlite` |

## Quick start

Requires **Node.js 20+**.

```bash
npm install          # installs root, backend and frontend dependencies
npm run setup        # creates .env files (random APP_SECRET), seeds the database, creates the admin account
npm run dev          # API on :4200, website on :3200
```

- Website: http://localhost:3200
- Admin: http://localhost:3200/admin. Sign in with `bryce.keller@kellerhvac.com` and the password `keller-admin`, then change the password in **Admin → Settings**. You can also set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before the first run.

Production: `npm run build && npm start`. Other scripts: `npm run seed` adds missing seed data and never overwrites your edits; `npm run db:reset` wipes the database and re-seeds it; `npm run typecheck`.

Ports (3200/4200) differ from the other sample projects, so they can run side by side.

## What the site does

| Route | Behaviour |
| ----- | --------- |
| `/` | Hero, service index, "what to expect" principles and the four-step request process (all editable in the admin). |
| `/air-conditioning`, `/heating`, `/installation-repairs` | Service pages. Lists, cards, checklists and FAQs come from the database. |
| `/about-contact` | Contact details, service area, hours and About copy from Admin → Settings. |
| `/request-service?service=…` | The service-request form, with the service pre-selected when you arrive from a service page. |
| `/privacy` | Privacy notice, editable in the admin. |
| `/admin` | Requests, Content, Images and Settings. |

Anything unknown returns a real 404. The site works on desktop, tablet and mobile. Below 1100 px the navigation becomes a Menu overlay, and the header shrinks as you scroll on desktop. There is a skip link, keyboard-friendly menus and FAQs, and entrance/scroll animations that respect reduced motion.

### Review mode vs production

**Admin → Settings → "Show draft markers"** controls the prototype's `draftMarkers` behaviour. When it is on, items that are not yet confirmed (the "what to expect" principles and the two "Maintenance" items) show with "draft" badges, and the unverified-address note appears. When it is off (production), unconfirmed items are hidden entirely.

### Service request form

- Validates fields on blur, then everything on submit, with the prototype's messages and an error summary whose links focus the fields. The **server re-validates everything**, including the preferred date (today to +180 days).
- Up to **3 photos**, 8 MB each. Types are checked by file signature (JPEG, PNG, WebP, HEIC), never by file name. Photos are **private**: stored on disk outside the public web root and shown only to signed-in admins.
- Anti-spam: a honeypot field, a signed form token that rejects submissions under 2.5 s, and **5 requests per 10 minutes per IP address** (IP addresses are stored only as salted hashes).
- On success: a success card with the reference (e.g. `KH-20261014-5P7M`), **Submit another request** and **Back to home**.
- On failure: an error banner and a **Try again** button; your details and photos are kept. Admin → Settings → Testing can simulate a failure.

### Admin

- **Sign-in:** checked on the server against a scrypt-hashed password, kept as an httpOnly session cookie. Five failed attempts lock sign-in for 5 minutes. A warning shows while the default password is in use.
- **Requests:** status counters that also act as filters, search (name, phone, email, reference), service and status filters, pagination and CSV export (formula-injection safe). The detail panel shows every field and the photos, lets you change status (recorded in the history), add internal notes, and delete.
- **Content:** nine editable sections (add, edit, delete, reorder, mark confirmed or draft). Use `{{phone}}` and `{{email}}` in text to insert the current contact details.
- **Images:** 13 photo slots matching the prototype's image placeholders; upload, replace, describe (alt text) or remove. Without a photo, the labelled placeholder is shown.
- **Settings:** review mode, contact details, address, service area, hours, About intro, the testing switch and password change.

## Structure

```
keller-hvac-services/
├── backend/src
│   ├── main.ts, app.module.ts, config/, common/ (rules, validation pipe, error filter, utils)
│   ├── database/        data source, entities, seed data + seeder
│   └── modules/         auth, settings, media, content, requests, health
├── frontend/
│   ├── app/(site)/      public pages (+ 404 / error)
│   ├── app/admin/       admin app
│   ├── components/      layout, request, faq, admin, ui
│   ├── lib/             API clients, types, validation mirror
│   └── styles/          design tokens + styles translated from the prototype
├── database/app.sqlite  (uploads are stored in database/uploads/)
└── package.json
```

The browser calls `/api/*` on the website's own address, and Next.js forwards those requests to NestJS (`next.config.ts`). This keeps the admin cookie first-party and avoids CORS. Server-rendered pages call the API directly using `BACKEND_URL`.

## API (prefix `/api`)

**Public:** `GET /site`, `GET /content`, `GET /media/:slot`, `GET /requests/options`, `GET /requests/form-token`, `POST /requests` (multipart; `201 {ref}`; errors `422 {errors}`, `400`, `429`, `503`), `GET /health`.

**Auth:** `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/password`.

**Admin (session cookie required):**
`GET /admin/requests?q=&status=&service=&page=`, `GET /admin/requests/export`, `GET|DELETE /admin/requests/:ref`, `GET /admin/requests/:ref/photos/:id`, `PATCH /admin/requests/:ref/status`, `PATCH /admin/requests/:ref/notes`,
`GET|PUT /admin/settings`,
`GET /admin/content/sections`, `GET|POST /admin/content/section/:section`, `PUT|DELETE /admin/content/item/:id`, `PATCH /admin/content/item/:id/move`,
`GET /admin/images`, `PUT|PATCH|DELETE /admin/images/:slot`.

Errors always look like this: `{ statusCode, message, errors?: { field: message } }`.

## Database

Tables: `settings`, `admin_users`, `content_items`, `site_images`, `service_requests`, `request_history`, `request_attachments`. The database runs in WAL mode with foreign keys on, and the schema comes from the entities (`DB_SYNCHRONIZE=true`).

Seed content is the prototype's copy: 30 content items across 9 sections (5 unconfirmed), default contact settings and review mode on.

## Before going live

1. Change the admin password and set a strong random `APP_SECRET` in `backend/.env` (`npm run setup` generates the secret).
2. Run with `NODE_ENV=production` behind HTTPS, so cookies are sent only over secure connections.
3. Upload real photos in Admin → Images, confirm the draft items, and verify the address (Settings).
4. Turn off **Show draft markers** and the testing switch.
5. Back up `database/` (it holds both the SQLite file and the private uploads).
