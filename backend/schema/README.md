# Database schema baseline

`current-production-baseline.sql` is the authoritative schema for creating a fresh database that matches the current production structure. Files in `backend/migrations` are retained as historical incremental migrations and must not be treated as a complete fresh-database baseline.

The baseline is not executed automatically and must never be imported over the current database or volume.
