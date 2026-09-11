# Online Leave System

## Start all services

For the first run after cloning, create the local environment file:

```powershell
Copy-Item .env.example .env
```

Then set secure values for `JWT_SECRET` and
`PASSWORD_RESET_OTP_SECRET` in `.env`, and start the services:

```powershell
docker compose up -d --build
```

The backend applies all approved additive database migrations automatically
before starting. Existing data is preserved, migrations are safe to run again,
and the backend will not start if the schema update fails.

Services:

- React frontend: http://localhost:18080
- phpMyAdmin: http://localhost:18081
- Node.js + Express backend: http://localhost:18082
- MailHog UI: http://localhost:18025
- API/DB health: http://localhost:18080/api/health
- MariaDB from host: `127.0.0.1:13307`

Host ports can be overridden in `.env` with `FRONTEND_PORT`,
`PHPMYADMIN_PORT`, `BACKEND_PORT`, `DB_HOST_PORT`, `MAILHOG_SMTP_PORT`, and
`MAILHOG_UI_PORT`.

Docker Compose creates the named volume `online-leave-system_mariadb_data`
automatically. On a newly cloned machine, MariaDB imports the tracked
`Before-Mentor-Test` database snapshot only when this volume is first created
and empty. Existing volumes are reused without importing or overwriting their
data.

Frontend and backend directories are bind mounted, so local edits are
reflected in Docker. Vite supplies hot module replacement for React changes
and Node runs in watch mode during local development when `npm run dev` is
used.

Authentication endpoints:

- `POST /api/auth/login` with JSON `{ "login": "...", "password": "..." }`
- `GET /api/auth/me`
- `POST /api/auth/logout`
