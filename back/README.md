# Veto-Care Backend

Express.js API connected to Supabase (Auth, Postgres, Storage) for the Veto-Care app.

## Architecture

Client applications (React or the local `index.html` tester) call this backend:

`Client -> Express API -> Supabase`

Why this setup:
- Keep business logic in your own backend.
- Control auth-protected routes with middleware.
- Expose clean API endpoints for frontend integration.

## Project Structure

```text
back/
├─ middleware/
│  └─ auth.js
├─ routes/
│  ├─ auth.js
│  ├─ vets.js
│  ├─ appointments.js
│  └─ upload.js
├─ utils/
│  └─ upload.js
├─ supabaseClient.js
├─ server.js
├─ index.html
├─ package.json
└─ .env
```

## Tech Stack

- Node.js + Express
- Supabase JS client
- CORS + dotenv
- Multer (memory upload for files)

## Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_or_service_key
PORT=3000
```

Notes:
- The backend reads `SUPABASE_KEY` first, and falls back to `SUPABASE_ANON_KEY` if present.
- Never commit real keys/tokens to Git.

## Installation and Run

```bash
npm install
npm start
```

Server default:
- `http://localhost:3000`

Health check:
- `GET /` -> `Welcome to Veto-Care API!`

## Authentication Flow

1. User signs up or logs in via `/api/auth/*`.
2. Supabase returns a JWT access token.
3. Client sends token as header:
   - `Authorization: Bearer <token>`
4. `middleware/auth.js` verifies token with `supabase.auth.getUser(token)`.
5. On success, `req.user` is attached and protected routes continue.

## API Endpoints

Base prefix: `/api`

### Auth (`/api/auth`)

- `POST /register` - create user account
- `POST /signup` - alias of register (kept for compatibility)
- `POST /login` - sign in and return session/token
- `PUT /profile` - update `profiles` table for current user (protected)

Profile fields accepted:
- `full_name`, `phone`, `avatar_url`, `bio`, `pet_name`, `pet_type`, `pet_breed`, `city`

### Veterinarians (`/api/vets`)

- `GET /` - list vets from `veterinaires`
- `POST /` - create a vet in `veterinaires` (protected)

Body for `POST /api/vets`:

```json
{
  "name": "Dr Example",
  "specialization": "Surgery",
  "email": "dr@example.com"
}
```

### Appointments (`/api/appointments`)

- `POST /` - create appointment in `rendez_vous` (protected)
- `GET /` - list current user appointments (protected)
- `GET /my-appointments` - compatibility endpoint, same intent (protected)
- `PUT /:id/cancel` - set appointment status to `cancelled` (protected)

Body for `POST /api/appointments`:

```json
{
  "vet_id": "uuid-of-veterinaire",
  "date_rdv": "2026-05-20T09:30:00",
  "file_path": "files/demo-health-record.pdf"
}
```

### Upload (`/api/upload`)

- `POST /` - upload one file to Supabase Storage bucket `health-records` (protected)
- Multipart field name must be `file`

Stored path format:
- `files/<timestamp>-<originalname>`

## Supabase Tables Used

- `profiles` (user profile data)
- `veterinaires` (veterinarian records)
- `rendez_vous` (appointments)
- Storage bucket: `health-records`

## Local Route Testing

Open `index.html` in your browser.

It provides buttons/forms to test all implemented routes:
- Auth register/signup/login/profile
- Vets get/create
- Appointments create/list/cancel
- Upload file
- Root health check

Set API base to:
- `http://localhost:3000/api`

## Common Issues

- `Invalid token`:
  - Missing/expired Bearer token.
  - Login again and retry.

- `Bucket not found`:
  - Create `health-records` bucket in Supabase Storage.

- `new row violates row-level security policy`:
  - Add/adjust Supabase RLS policies for inserts/selects.
  - Or use a backend key strategy that matches your security model.

- Appointment insert errors:
  - Ensure `vet_id` matches an existing `veterinaires.id` value (usually UUID, not `1`).

## Scripts

- `npm start` - run server
- `npm test` - placeholder message (no automated tests configured yet)

## Next Improvements

- Add request validation (Zod/Joi).
- Add centralized error handling middleware.
- Add role-based authorization (admin/vet/user).
- Add Swagger/OpenAPI docs.
- Add automated tests (route + integration).
