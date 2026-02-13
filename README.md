# URL Shortener Service

A production-ready RESTful API service for URL shortening. Built with Node.js, Express, PostgreSQL, and Redis following clean architecture principles.

## Features

- ✅ Create shortened URLs with unique codes
- ✅ Retrieve original URLs from short codes
- ✅ Update existing shortened URLs
- ✅ Delete shortened URLs
- ✅ Access statistics tracking
- ✅ Automatic 301 redirects
- ✅ Redis caching for improved performance
- ✅ Input validation with Zod
- ✅ Clean architecture with separation of concerns

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Cache:** Redis
- **Validation:** Zod
- **Code Generation:** nanoid

## Project Structure

```
url-shortener/
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   └── redis.js         # Redis client configuration
│   ├── infra/
│   │   └── http/
│   │       ├── server.js    # Express app setup
│   │       └── routes.js    # Route registration
│   ├── modules/
│   │   └── url/
│   │       ├── controller.js  # Request handlers
│   │       ├── service.js     # Business logic
│   │       ├── repository.js  # Database operations
│   │       ├── routes.js      # URL routes
│   │       ├── schema.js      # Validation schemas
│   │       ├── mapper.js      # Data transformation
│   │       └── index.js       # Module exports
│   └── shared/
│       ├── middlewares/
│       │   └── errorHandler.js
│       └── utils/
│           └── generateShortCode.js
├── app.js                  # Application bootstrap
├── index.js                # Entry point
└── package.json

```

## API Endpoints

### 1. Create Short URL
```http
POST /shorten
Content-Type: application/json

{
  "url": "https://www.example.com/some/long/url"
}
```

**Response (201 Created):**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z"
}
```

### 2. Get URL Information
```http
GET /shorten/:shortCode
```

**Response (200 OK):**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z"
}
```

### 3. Update Short URL
```http
PUT /shorten/:shortCode
Content-Type: application/json

{
  "url": "https://www.example.com/some/updated/url"
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/updated/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:30:00Z"
}
```

### 4. Delete Short URL
```http
DELETE /shorten/:shortCode
```

**Response:** `204 No Content`

### 5. Get URL Statistics
```http
GET /shorten/:shortCode/stats
```

**Response (200 OK):**
```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z",
  "accessCount": 10
}
```

### 6. Redirect to Original URL
```http
GET /:shortCode
```

**Response:** `301 Moved Permanently` (Redirects to original URL)

### 7. Health Check
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2021-09-01T12:00:00Z",
  "uptime": 123.456
}
```

## Installation

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v14+)
- Redis (v6+)
- Docker (optional, for Redis container)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GiovanaGuedesSilva/url-shortener.git
   cd url-shortener
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start PostgreSQL and create database:**
   
   **Option A: Using psql directly**
   ```bash
   psql -U postgres
   ```
   
   Then in psql:
   ```sql
   CREATE DATABASE urlshortener;
   \c urlshortener
   \i database/init.sql
   ```
   
   **Option B: Using command line**
   ```bash
   # Windows (PowerShell)
   $env:PGPASSWORD="postgres"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE urlshortener;"
   $env:PGPASSWORD="postgres"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d urlshortener -f "database/init.sql"
   ```

4. **Start Redis:**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   docker run -d --name url-shortener-redis -p 6379:6379 redis:alpine
   ```
   
   **Option B: Using local Redis**
   ```bash
   redis-server
   ```

5. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development

   # PostgreSQL
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=urlshortener
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

6. **Run the application:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

### Testing the API

Run the automated test script:
```powershell
.\test-api.ps1
```

Or test manually:
```bash
curl http://localhost:3000/health
```

## Usage Examples

### Using cURL

**Create a short URL:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url"}'
```

**Get URL info:**
```bash
curl http://localhost:3000/shorten/abc123
```

**Update URL:**
```bash
curl -X PUT http://localhost:3000/shorten/abc123 \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/new/url"}'
```

**Get statistics:**
```bash
curl http://localhost:3000/shorten/abc123/stats
```

**Delete URL:**
```bash
curl -X DELETE http://localhost:3000/shorten/abc123
```

**Access shortened URL (redirect):**
```bash
curl -L http://localhost:3000/abc123
```

### Using PowerShell

**Create a short URL:**
```powershell
$body = @{ url = "https://github.com/GiovanaGuedesSilva" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/shorten" -Method POST -Body $body -ContentType "application/json"
Write-Host "Short Code: $($response.shortCode)"
```

**Get URL information:**
```powershell
$code = "abc123"
$info = Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method GET
$info | ConvertTo-Json
```

**Update URL:**
```powershell
$body = @{ url = "https://github.com/GiovanaGuedesSilva/url-shortener" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method PUT -Body $body -ContentType "application/json"
```

**Get statistics:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code/stats" -Method GET
```

**Delete URL:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method DELETE
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data",
  "details": [
    {
      "message": "Invalid URL format"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "URL not found"
}
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

## Architecture

### Layered Architecture

- **Controller Layer:** Handles HTTP requests and responses
- **Service Layer:** Contains business logic and orchestrates operations
- **Repository Layer:** Manages database operations
- **Infrastructure Layer:** External services (database, cache, HTTP server)

### Key Design Decisions

1. **Caching Strategy:** Redis caching with 24-hour TTL for improved performance
2. **URL Validation:** Zod schema validation for robust input checking
3. **Unique Code Generation:** nanoid for generating short, URL-safe codes
4. **Error Handling:** Centralized error handling middleware
5. **Access Tracking:** Automatic increment of access counter on redirects

## Performance Optimizations

- Redis caching reduces database load
- Database indexes on `short_code` for fast lookups
- Asynchronous access counter updates
- Connection pooling for PostgreSQL

## Development

### Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run tests (not yet implemented)
```

### Docker Management

```powershell
# View running containers
docker ps

# Stop Redis
docker stop url-shortener-redis

# Start Redis
docker start url-shortener-redis

# View Redis logs
docker logs url-shortener-redis

# Remove container
docker rm url-shortener-redis
```

### Adding New Features

1. Create new modules in `src/modules/`
2. Follow the existing pattern: controller → service → repository
3. Register routes in `src/infra/http/routes.js`
4. Add validation schemas if needed

## Troubleshooting

### Server won't start

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill Node.js processes
Get-Process -Name node | Stop-Process -Force
```

### PostgreSQL connection issues

```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Test connection manually
psql -U postgres -d urlshortener -c "SELECT 1;"
```

### Redis connection issues

```powershell
# Check Docker container
docker ps | findstr redis

# View logs
docker logs url-shortener-redis

# Restart container
docker restart url-shortener-redis
```

## Database Schema

```sql
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  access_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_short_code ON urls(short_code);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_urls_updated_at
    BEFORE UPDATE ON urls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Architecture Details

### Request Flow

```
Client Request
      ↓
┌─────────────────┐
│   Controller    │  ← Validates input (Zod)
└─────────────────┘
      ↓
┌─────────────────┐
│    Service      │  ← Checks Redis cache
└─────────────────┘  ← Business logic
      ↓
┌─────────────────┐
│   Repository    │  ← Database queries
└─────────────────┘
      ↓
   PostgreSQL
```

### Design Patterns

- **Layered Architecture**: Separation of concerns
- **Dependency Injection**: Services receive repositories
- **Repository Pattern**: Abstract data access
- **Cache-Aside**: Redis for performance
- **Factory Pattern**: Code generation with nanoid

## Performance Considerations

- **Redis Caching**: 24-hour TTL reduces database load
- **Database Indexing**: Fast lookups on `short_code`
- **Connection Pooling**: Efficient PostgreSQL connections
- **Async Operations**: Non-blocking I/O for all operations
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT

## Security Notes

1. **Input Validation**: All inputs validated with Zod
2. **SQL Injection**: Parameterized queries prevent attacks
3. **URL Validation**: Only valid URLs accepted (max 2048 chars)
4. **Error Handling**: No sensitive data in error messages
5. **Environment Variables**: Sensitive config in `.env` (gitignored)

## Future Enhancements

- [ ] Implement rate limiting per IP
- [ ] Add JWT authentication
- [ ] Create frontend interface
- [ ] Add comprehensive test suite (Jest/Mocha)
- [ ] Implement analytics dashboard
- [ ] Add custom short code support
- [ ] Deploy to cloud (Azure/AWS/Heroku)
- [ ] Add monitoring with Prometheus
- [ ] Implement URL expiration
- [ ] Add QR code generation

## License

MIT

## Author

Giovana Guedes - [GitHub](https://github.com/GiovanaGuedesSilva)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
