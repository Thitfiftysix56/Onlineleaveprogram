# Online Leave System

## Start all services

```powershell
docker compose up -d --build
```

Services:

- React frontend: http://localhost:8080
- phpMyAdmin: http://localhost:8081
- Node.js + Express backend: http://localhost:8082
- API/DB health: http://localhost:8080/api/health
- MariaDB from host: `127.0.0.1:3307`

The `frontend`, `backend`, `db`, and `phpmyadmin` services reuse the existing Docker volume
`online-leave-system_mariadb_data`. Frontend and backend directories are bind
mounted, so local edits are reflected in Docker. Vite supplies hot module
replacement for React changes and Node runs in watch mode during local
development when `npm run dev` is used.

Authentication endpoints:

- `POST /api/auth/login` with JSON `{ "login": "...", "password": "..." }`
- `GET /api/auth/me`
- `POST /api/auth/logout`
