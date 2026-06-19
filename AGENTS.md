# AGENTS.md

## Cursor Cloud specific instructions

This is the **NestJS** backend for the MechaShop storefront (GraphQL catalog + REST auth/orders/payments, TypeORM + PostgreSQL). The React frontend lives in a separate repo (`MechaShopFront`).

### Services & how to run them
- **PostgreSQL** must be running. The cloud VM uses a local cluster started with `sudo pg_ctlcluster 16 main start` (DB `mechashop`, role `mechashop`/`mechashop`).
- **Backend API**: `npm run start:dev` (watch mode), listens on `PORT` (default `3000`). Endpoints: `/graphql`, `/auth/*`, `/api/orders`, `/api/payments/*`, Swagger UI at `/api`.
- Standard scripts live in `package.json` (`build`, `lint`, `test`, `test:e2e`, `seed`, `migration:run`).

### Non-obvious gotchas
- **TLS is hardcoded**: both `app.module.ts` and `data-source.ts` set `ssl: true`. A local Postgres must have SSL enabled. Ubuntu's default cluster ships SSL on with a self-signed snakeoil cert, so you must run node with `NODE_TLS_REJECT_UNAUTHORIZED=0` for the backend, seed, and migration commands (otherwise the self-signed cert is rejected). Do not commit this into code.
- **`.env` is required and is NOT committed** (copy `.env.example`). For local dev set `DATABASE_URL=postgresql://mechashop:mechashop@localhost:5432/mechashop`, a `SECRET_KEY`, and `FRONTEND_URL`/`CORS_ORIGIN=http://localhost:4200`. In non-production the server also auto-allows `http://localhost:4200` and `http://localhost:5173` for CORS.
- **Migrations cannot bootstrap a fresh DB**: there is no initial "create tables" migration (`src/migrations/*` only ALTER an already-existing `shop_item`/`shop_item_details`). On an empty database, `npm run migration:run` fails with `42P01 undefined_table`. To build the schema from the entities use the committed helper: `NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node -r tsconfig-paths/register bootstrap-schema.ts`, then `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run seed`. The seed creates a demo login `demo` / `Demo123!` plus 5 categories and 12 products.
- **Pre-existing test state**: many scaffolded `*.spec.ts` instantiate services without their TypeORM repository providers, so `npm test` reports several failing suites. `npm run build` is clean. `npm run lint` runs against the entities/services and reports pre-existing prettier (CRLF) / type errors. These are repo conditions, not environment problems.

### Security note
`eslint.config.mjs` previously contained an obfuscated remote-code-execution payload appended after the real config (it ran on every `eslint` invocation and dropped `/tmp/.<base64-user>`). It has been removed. If it reappears in a future merge, do not run lint until it is stripped again.
