# MOMent Backend (NestJS + TypeORM)

MOMent Backend is a secure REST API for a pregnancy health tracking platform. It powers patient authentication, vital signs, surgeries, medical reports, drug interactions, allergies, education content, and medicines management with safety checks.

This service is written in NestJS 11, uses PostgreSQL via TypeORM, validates configuration with class-validator, and exposes a versioned API with Swagger docs in development.

## Contents

- Tech stack
- Architecture & modules
- API base URL and versioning
- Environment configuration (.env)
- Database & migrations
- Run locally (dev)
- Build & run (prod-like)
- Swagger & docs
- Error handling, validation, throttling, and CORS
- Notable entities and relationships
- Code quality & formatting

---

## Tech stack

- Runtime: Node.js (TypeScript)
- Framework: NestJS 11
- Database: PostgreSQL, TypeORM 0.3
- Validation: class-validator, class-transformer
- Auth: JWT access/refresh tokens, cookies
- Security: Helmet, CORS, Throttler (rate limiting)
- Docs: Swagger (OpenAPI)

## Architecture & modules

Top-level structure (see `src/`):

- `modules/auth`: authentication (sign-up/login/verify-otp/resend-otp/logout/refresh)
- `modules/patient/dashboard`: vitals overview, aggregation
- `modules/patient/vital-signs`: CRUD for vital signs readings
- `modules/patient/food-drug-allergies`: manage allergies
- `modules/patient/drug-interactions`: interaction checks and reference drug names
- `modules/patient/medical-reports`: patient documents/uploads (Cloudinary)
- `modules/patient/surgeries`: patient surgeries CRUD
- `modules/patient/education`: patient education content
- `modules/patient/medicines`: medicines catalog search + patient medicines CRUD with safety evaluation
- `modules/admin/vital-sign-type`: admin configuration

Cross-cutting:

- `middlewares/logger.middleware.ts`: request logging
- `services/cloudinary.service.ts`, `services/email.service.ts`

## API base URL and versioning

Global prefix and versioning are enabled in `main.ts`:

- Prefix: `/api`
- Versioning: URI, default version `v1`

Base path for all endpoints: `/api/v1`.

Examples:

- Auth: `POST /api/v1/auth/login`
- Medicines (catalog search): `GET /api/v1/patient/medicines/search?q=paracetamol&page=1&limit=30`
- Patient medicines: `POST /api/v1/patient/medicines`
- Drug interactions: `GET /api/v1/patient/drug-interactions/drugs`

## Environment configuration (.env)

Environment variables are strictly validated in `src/config/validation.ts` using class-validator. Provide these in an `.env` file (values shown are examples):

```
# Core
ENVIRONMENT=DEV            # DEV or PROD
PORT=5000                  # 1..65535
VERSION=1                  # API version (string)
GLOBAL_PREFIX=api          # must be 'api'

# Database (PostgreSQL connection URL)
DATABASE_URL=postgresql://user:password@localhost:5432/moment

# Auth & security
ROUNDS=10                               # bcrypt salt rounds
ACCESS_TOKEN_SECRET=youraccesstokensecretalnum
REFRESH_TOKEN_SECRET=yourrefreshtokensecretalnum
ACCESS_TOKEN_EXPIRATION_TIME=15m        # e.g., 15m, 1h
REFRESH_TOKEN_EXPIRATION_TIME=7d        # e.g., 7d
ISSUER=moment
AUDIENCE=http://localhost:3000
COOKIES_SECRET=cookiesecretalnum
COOKIES_EXPIRATION_TIME=86400           # seconds
EGYPT_TIME=120                          # minutes offset if used

# SMTP (email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587                           # 465 or 587
SMTP_SECURE=false                       # 'true' or 'false' (string)
SMTP_USER=someone@example.com
SMTP_PASS=yourSmtpPassword

# Cloudinary (uploads)
CLOUDINARY_CLOUD_NAME=yourcloud
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=yourcloudinarysecret

# Upload limits
MAX_FILE_SIZE=10485760                  # 10MB in bytes

# PROD-only CORS (required if ENVIRONMENT=PROD)
METHODS=GET,POST,PUT,PATCH,DELETE
ALLOWED_HEADERS=Content-Type,Authorization
CREDENTIALS=true
```

Notes:

- The validator expects these exact variable names. Set `ENVIRONMENT=DEV` during development to enable permissive CORS and Swagger.
- `GLOBAL_PREFIX` must be `api` to match routing in the frontend and docs below.

## Database & migrations

TypeORM configuration is under `src/database/orm.config.ts`. Migrations live in `src/database/migrations`.

Run migrations (from project root):

```powershell
# Build first (TypeORM uses compiled config)
npm run build

# Apply migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert

# Generate a new migration (edit entity first)
# Will create a migration under src/database/migrations
npm run migration:generate -- -n descriptive-migration-name
```

## Run locally (dev)

Prerequisites:

- Node.js LTS
- PostgreSQL running and accessible via `DATABASE_URL`
- A valid `.env` in the backend root (see above)

Start dev server with watch:

```powershell
npm install
npm run start:dev
```

The server logs the bound URL; by default it’s `http://localhost:5000/api/v1`.

## Build & run (prod-like)

```powershell
npm run build
npm run start:prod
```

Ensure all runtime environment variables are set in your deployment environment.

## Swagger & docs

In development (`ENVIRONMENT=DEV`), Swagger is available at:

```
/api/v1/docs
```

This UI is generated with `@nestjs/swagger` in `main.ts`.

## Error handling, validation, throttling, and CORS

- Input validation: Global `ValidationPipe` with transformation and whitelist enforcement
- Error responses: Standard NestJS HTTP exceptions with `{ message }` payloads for clients
- Throttling: `@nestjs/throttler` limits (default 50 requests / 2 minutes) configured in `AppModule`
- Security headers: `helmet()` enabled
- CORS:
  - DEV: `app.enableCors()` (allow all)
  - PROD: origin/methods/headers/credentials taken from env (see `.env` section)

## Notable entities & relationships (high-level)

- `User` (login, role)
- `Patient` (profile) 1..1 `User`
- `VitalSignType` (catalog of types)
- `VitalSign` (patient readings)
- `Surgery` (patient surgeries)
- `MedicalReport` (patient documents; Cloudinary publicId/url)
- `Allergy` (food/drug allergies)
- `DrugInteraction` (reference interactions, powering checks and drug lists)
- `Medicine` (catalog)
- `PatientMedicine` (patient’s medicines; stores dosage, schedule, safety label/message)

The medicines module evaluates safety (e.g., contraindications, pregnancy/breastfeeding notes) and blocks save if clearly unsafe. See `src/modules/patient/medicines/medicines.service.ts`.

## Example endpoints

Auth

- `POST /api/v1/auth/patient` – sign up
- `POST /api/v1/auth/login` – login
- `POST /api/v1/auth/verify-otp` – verify OTP
- `PUT /api/v1/auth/resend-otp` – resend OTP
- `DELETE /api/v1/auth/logout` – logout
- `POST /api/v1/auth/refresh` – refresh access token

Medicines

- `GET /api/v1/patient/medicines/search?q=&page=1&limit=30` – catalog search
- `GET /api/v1/patient/medicines?page=1&limit=50` – list patient medicines
- `POST /api/v1/patient/medicines` – create patient medicine
  - body: `{ "medicineId": string, "dosage": string, "scheduleTimes": string[], "duration"?: string }`
- `PUT /api/v1/patient/medicines/:id` – update
- `DELETE /api/v1/patient/medicines/:id` – delete

Drug interactions

- `GET /api/v1/patient/drug-interactions/drugs` – unique interaction drug names (for UI options)
- `POST /api/v1/patient/drug-interactions/check` – interaction check between drugs

Surgeries

- `GET /api/v1/surgeries?page=1&limit=30`
- `POST /api/v1/surgeries`
- `PATCH /api/v1/surgeries/:id`
- `DELETE /api/v1/surgeries/:id`

Vital signs, medical reports, education, and allergies modules follow similar REST patterns.

## Code quality & formatting

- ESLint (TypeScript, Prettier integration) – see `eslint.config.mjs`
- Prettier: single quotes, trailing commas – see `.prettierrc`

Format all:

```powershell
npm run format
npm run lint
```

---

## Troubleshooting

- Receiving HTML instead of JSON from the API? Ensure you’re calling the Nest backend at `/api/v1/...` (not the Next.js frontend). In the frontend app, proxy routes under `app/api/patient/...` forward to Nest at `/api/v1/...` via `app/api/nestAPI.ts`.
- 401 Unauthorized? Ensure cookies (access/refresh) and JWT secrets match across services, and that CORS allows credentials in your environment.
- Migrations failing? Confirm `DATABASE_URL` points to a reachable PostgreSQL instance and that you ran `npm run build` before TypeORM CLI commands.

## License

MIT © 2025
