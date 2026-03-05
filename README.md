# URL Shortener Service

A RESTful API service for URL shortening built with Node.js, Express, PostgreSQL, and Redis.

Projeto do [roadmap.sh](https://roadmap.sh/projects/url-shortening-service).

## Features

- Create shortened URLs with unique 7-character codes
- Retrieve original URL info by short code
- Update existing shortened URLs
- Delete shortened URLs
- Access statistics tracking (redirect counter)
- Automatic 301 redirects
- Redis caching with 24-hour TTL
- Input validation with Zod
- Graceful shutdown (closes DB and Redis on SIGTERM/SIGINT)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express.js v5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Validation | Zod |
| Code generation | nanoid |
| Reverse proxy | nginx (Docker only) |

## Project Structure

```
url-shortener/
├── src/
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection pool
│   │   └── redis.js           # Redis client (optional — app runs without it)
│   ├── infra/
│   │   └── http/
│   │       ├── server.js      # Express app setup
│   │       └── routes.js      # Route registration
│   ├── modules/
│   │   └── url/
│   │       ├── controller.js  # Request/response handlers
│   │       ├── service.js     # Business logic + cache strategy
│   │       ├── repository.js  # SQL queries (parameterized)
│   │       ├── routes.js      # URL router
│   │       ├── schema.js      # Zod validation schema
│   │       ├── mapper.js      # DB row → response object
│   │       └── index.js       # Barrel exports
│   └── shared/
│       ├── middlewares/
│       │   └── errorHandler.js
│       └── utils/
│           └── generateShortCode.js
├── database/
│   └── init.sql               # Manual setup script (with reset DROPs)
├── docker/
│   ├── nginx/nginx.conf       # nginx reverse proxy config
│   ├── postgres/init.sql      # Docker auto-init schema (no DROPs)
│   └── redis/redis.conf       # Redis config (LRU, 256 MB)
├── app.js                     # Server factory (connects DB + Redis)
├── index.js                   # Entry point + graceful shutdown
├── Dockerfile                 # Node.js 20 Alpine image
├── docker-compose.yml         # Full stack: app, nginx, postgres, redis
└── package.json
```

## Quick Start

### Option A — Docker Compose (full stack, recommended)

Starts everything (app, nginx, postgres, redis) with one command. The database schema is applied automatically on first run.

```bash
docker-compose up --build
```

The API will be available at `http://localhost` (port 80 via nginx).

To tear down and remove volumes:
```bash
docker-compose down -v
```

### Option B — Local development

Run PostgreSQL and Redis via Docker, and the app directly with Node.js for faster iteration.

**1. Start infrastructure:**
```bash
docker-compose up postgres redis -d
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment:**
```bash
cp .env.example .env
# Edit .env if your credentials differ from the defaults
```

**4. Apply the database schema:**

```bash
# Windows (PowerShell)
$env:PGPASSWORD="postgres"
& "psql" -U postgres -c "CREATE DATABASE urlshortener;"
& "psql" -U postgres -d urlshortener -f "database/init.sql"
```

```bash
# Linux / macOS
psql -U postgres -c "CREATE DATABASE urlshortener;"
psql -U postgres -d urlshortener -f database/init.sql
```

**5. Run the application:**
```bash
npm run dev     # development (nodemon, auto-reload)
npm start       # production
```

The API will be available at `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `urlshortener` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | _(empty)_ | Redis password (optional) |

> Redis is **optional** — if unavailable the app runs without caching and logs a warning.

## API Reference

### Health Check
```http
GET /health
```
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 42.3
}
```

---

### Create Short URL
```http
POST /shorten
Content-Type: application/json

{ "url": "https://www.example.com/some/long/url" }
```
**201 Created**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc1234",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

### Get URL Info
```http
GET /shorten/:shortCode
```
**200 OK** — same shape as create response (no `accessCount`).

---

### Update Short URL
```http
PUT /shorten/:shortCode
Content-Type: application/json

{ "url": "https://www.example.com/updated/url" }
```
**200 OK** — returns updated object.

---

### Delete Short URL
```http
DELETE /shorten/:shortCode
```
**204 No Content**

---

### Get URL Statistics
```http
GET /shorten/:shortCode/stats
```
**200 OK**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc1234",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "accessCount": 10
}
```

---

### Redirect
```http
GET /:shortCode
```
**301 Moved Permanently** — redirects to the original URL.

## Error Responses

### 400 Bad Request
```json
{ "errors": ["Invalid URL format"] }
```

### 404 Not Found
```json
{ "error": "URL not found" }
```

### 500 Internal Server Error
```json
{
  "error": {
    "message": "Internal Server Error",
    "status": 500
  }
}
```
> In `development` mode, `stack` is also included in the 500 response.

## Testing

Run the automated integration test script (requires the server to be running):
```powershell
.\test-api.ps1
```

The script covers all 7 endpoints: health, create, get info, update, stats, redirect (301), delete, and deletion verification (404).

## Architecture

### Request Flow

```
Client
  ↓
nginx (port 80)          ← Docker only
  ↓
Express app (port 3000)
  ↓
Controller               ← validates input (Zod)
  ↓
Service                  ← cache-aside (Redis), business logic
  ↓
Repository               ← parameterized SQL (pg.Pool)
  ↓
PostgreSQL
```

### Caching Strategy (cache-aside)

- **Redirect (`GET /:shortCode`)** — checks Redis first; on miss, queries DB, increments counter, populates cache.
- **Get info (`GET /shorten/:shortCode`)** — checks Redis first; on miss, queries DB. Counter is **not** incremented.
- **Stats (`GET /shorten/:shortCode/stats`)** — always queries DB directly to return the real access count.
- **Update / Delete** — invalidates cache after write.

## Database Schema

```sql
CREATE TABLE urls (
    id           SERIAL PRIMARY KEY,
    url          TEXT NOT NULL,
    short_code   VARCHAR(10) UNIQUE NOT NULL,
    access_count INTEGER DEFAULT 0 NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_short_code ON urls(short_code);
```

A `BEFORE UPDATE` trigger keeps `updated_at` current automatically.

## Development

### Scripts

```bash
npm start       # production
npm run dev     # development (nodemon)
npm test        # not yet implemented
```

### Docker Compose — useful commands

```bash
docker-compose up --build          # build and start all services
docker-compose up postgres redis   # infrastructure only (for local dev)
docker-compose logs -f app         # tail app logs
docker-compose down                # stop and remove containers
docker-compose down -v             # also remove volumes (wipes DB)
```

## Future Enhancements

- [ ] Rate limiting per IP
- [ ] JWT authentication
- [ ] Custom short code support
- [ ] URL expiration
- [ ] Comprehensive test suite (Jest/Vitest)
- [ ] QR code generation
- [ ] Analytics dashboard

## License

MIT

## Author

Giovana Guedes — [GitHub](https://github.com/GiovanaGuedesSilva)
