# Gym Manager — Agent Context

## Overview

**Gym Manager** is a full-stack web application for managing gym memberships, subscriptions, insurances, and staff. It includes an installation wizard, role-based access control, automated email notifications, and a statistics dashboard with charts.

## Architecture

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 19 + Vite |
| Auth | Laravel Sanctum (Bearer tokens) |
| Styling | Bootstrap 5 + custom CSS |
| Charts | Chart.js + react-chartjs-2 |
| Tables | react-data-table-component |
| i18n | JSON language files (`frontend/public/langs/`) |

## Project Structure

```
├── backend/               # Laravel API
│   ├── app/Http/Controllers/   # API controllers
│   ├── app/Models/             # Eloquent models
│   ├── database/migrations/    # Schema migrations
│   ├── routes/api.php          # API route definitions
│   └── resources/js/settings.json   # Runtime app settings (SMTP, business info, alerts)
├── frontend/              # React SPA
│   ├── src/pages/         # Route-level pages
│   ├── src/components/    # Reusable UI components
│   ├── src/context/       # Global state (useReducer)
│   ├── src/api/api.js     # Axios instance with auth interceptors
│   └── public/langs/      # ar.json, en.json, fr.json
└── docker-compose.yml
```

## Database Models

- **users** — Staff accounts. Fields: name, email, username, password, cin, phone, picture, sexe, role_id, active.
- **roles** — Role definitions (e.g., admin, manager).
- **customers** — Gym members. Fields: name, cin, phone, email, sexe, state, adresse.
- **plans** — Membership plans. Fields: title, duration (days), price, description, color.
- **subscriptions** — Customer subscriptions. Fields: start_at, expire_at, duration, price, notice_times, pre_notice_times, expire_notice_times, last_notified_at.
- **insurances** — Customer insurances. Fields: start_at, expire_at, price, peride, notice_times.

## Core Features

1. **Installation Wizard** (`/install`)
   - First-time setup creates the admin user and writes `settings.json`.
   - Configures: business info, SMTP credentials, alert rules, message templates, invoice header/footer, default insurance price/period.

2. **Authentication**
   - Login with username + password.
   - Password reset via email verification code.
   - Token stored in `localStorage` as `auth_token`.

3. **Role-Based Access Control**
   - `admin` middleware protects role/plan/user management and settings updates.
   - Logged-in users can access customers, subscriptions, insurances, and statistics.

4. **Customer Management**
   - CRUD + profile view.
   - Email notifications: bulk (pre-expire / expired) or individual.
   - Customer state is derived from their latest subscription dates.

5. **Subscription Management**
   - Subscriptions link a customer to a plan.
   - States calculated dynamically: **Active**, **Pre-expire** (≤7 days left), **Expired**, **Upcoming**.

6. **Insurance Management**
   - Track customer insurance policies with start/end dates.

7. **Plan Management**
   - Admin-only CRUD for membership plans.

8. **User Management**
   - Admin-only CRUD for staff accounts.

9. **Dashboard / Statistics**
   - Filterable by: today, yesterday, week, month, year, custom date range.
   - KPIs: turnover, new customers, subscriptions, active subscribers.
   - Charts: turnover trend, new customers by gender, subscriptions by gender, subscription states (pie), subscriptions per plan (bar).

10. **Settings**
    - Business info, email/SMTP, alert settings, message templates, invoice settings.
    - Alerts support auto-notifications with configurable days-before-expiration, max notice times, and days-between-alerts.

11. **Email Notifications**
    - SMTP configured dynamically from `settings.json` at runtime.
    - Templates support placeholders: `{name}`, `{plan_name}`, `{expiry_date}`.

## API Routing (backend/routes/api.php)

| Middleware | Endpoints |
|------------|-----------|
| Public | `POST login`, `POST register`, `POST validateUser`, `POST sendVerCode`, `POST validateCode`, `GET checkInstall`, `POST install`, `GET images/{filename}` |
| `auth:sanctum` | `GET user`, `GET logout`, `POST resetPassword`, `GET settings`, `GET statistics`, `GET/POST/PUT/DELETE customers`, `GET/POST/DELETE subscriptions`, `GET/POST/DELETE insurances`, `GET plans`, `GET/PUT users` |
| `auth:sanctum` + `admin` | `POST/PUT/DELETE roles`, `POST/POST-update/DELETE users`, `POST/POST-update/PUT/DELETE plans`, `POST settings` |

## Frontend Routing

- `MainRoute` handles install check → either shows `InstallPage` or normal routes.
- `LoginRoute` (`/login/*`) — login + password reset flows.
- `LoggedRoute` — wrapper with sidebar/navbar.
  - `AdminRoute` (`/*`) — dashboard, users, plans, settings, statistics (admin only).
  - `CustomersRoute` (`/Customers/*`)
  - `SubscriptionsRoute` (`/subscriptions/*`)
  - `InsurancesRoute` (`/insurances/*`)

## Coding Conventions

### Backend (Laravel)
- Controllers return JSON responses with `message` and optional `data` keys.
- HTTP status codes from `Symfony\Component\HttpFoundation\Response`.
- Models use `HasFactory` and explicit `$fillable` arrays.
- Settings are read from `resources/js/settings.json` via `File::get()`.
- SMTP is reconfigured on the fly in controllers that send mail (`Config::set` + `Mail::purge`).

### Frontend (React)
- Functional components with hooks.
- Global state via custom `useReducer` context (`AppContext` in `context/context.jsx`).
- API calls use the axios instance in `api/api.js`.
- `Lang` component / helper used for all user-facing strings.
- Tables use `react-data-table-component` with custom styling defined in context.
- Date handling uses `date-fns`; date range picker uses `react-date-range`.

## Environment & Build

- Backend: `composer install`, `php artisan key:generate`, `php artisan migrate`.
- Frontend: `npm install`, `npm run dev` (Vite dev server) or `npm run build`.
- Docker support via `docker-compose.yml`.
- The `BACK_END_LINK` is defined in `frontend/src/assets/js/global.js`.

## Key Files for Agents

| Purpose | Path |
|---------|------|
| API routes | `backend/routes/api.php` |
| Auth / API client | `frontend/src/api/api.js` |
| Global state | `frontend/src/context/context.jsx` |
| App settings | `backend/resources/js/settings.json` |
| Main router | `frontend/src/pages/main.route.jsx` |
| Language data | `frontend/public/langs/{fr,en,ar}.json` |
| Statistics logic | `backend/app/Http/Controllers/StatisticsController.php` |
| Customer notifications | `backend/app/Http/Controllers/CustomerController.php` |

## Important Notes

- Do **not** commit `backend/resources/js/settings.json` if it contains SMTP passwords; it is currently tracked.
- Image uploads are stored in `storage/app/private/images/` and served via a custom route.
- The `checkInstall` endpoint reads `settings.json`; if missing, the app is considered not installed.
- Frontend relies on `auth_token` in `localStorage`; 401 responses trigger a full page reload.
- The `subscriptions` table migration was later extended with `pre_notice_times`, `expire_notice_times`, and `last_notified_at` via an additional migration.
