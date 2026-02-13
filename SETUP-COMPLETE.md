# 🎉 URL Shortener - Setup Completo!

## ✅ Status da Configuração

### PostgreSQL
- ✅ Banco de dados `urlshortener` criado
- ✅ Tabela `urls` com estrutura completa:
  - `id` (SERIAL PRIMARY KEY)
  - `url` (TEXT NOT NULL)
  - `short_code` (VARCHAR(10) UNIQUE NOT NULL)
  - `access_count` (INTEGER DEFAULT 0)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- ✅ Índice em `short_code` para buscas rápidas
- ✅ Trigger automático para atualizar `updated_at`

### Redis
- ✅ Container Docker rodando: `url-shortener-redis`
- ✅ Porta: 6379
- ✅ Imagem: redis:alpine

### Aplicação Node.js
- ✅ Dependências instaladas (126 packages)
- ✅ Arquivo `.env` configurado
- ✅ Conexão com PostgreSQL funcionando
- ✅ Conexão com Redis funcionando
- ✅ Servidor HTTP rodando na porta 3000

---

## 🚀 Como Usar

### Iniciar o Servidor

```powershell
# Modo produção
npm start

# Modo desenvolvimento (com auto-reload)
npm run dev
```

### Testar a API

```powershell
# Executar todos os testes
.\test-api.ps1
```

### Gerenciar Containers Docker

```powershell
# Ver containers rodando
docker ps

# Parar Redis
docker stop url-shortener-redis

# Iniciar Redis
docker start url-shortener-redis

# Ver logs do Redis
docker logs url-shortener-redis
```

---

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```
**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2026-02-12T...",
  "uptime": 123.456
}
```

### 2. Criar URL Curta
```http
POST /shorten
Content-Type: application/json

{
  "url": "https://www.example.com/very/long/url"
}
```
**Resposta (201):**
```json
{
  "id": "1",
  "url": "https://www.example.com/very/long/url",
  "shortCode": "abc123",
  "createdAt": "2026-02-12T...",
  "updatedAt": "2026-02-12T..."
}
```

### 3. Obter Informações da URL
```http
GET /shorten/:shortCode
```
**Resposta (200):**
```json
{
  "id": "1",
  "url": "https://www.example.com/very/long/url",
  "shortCode": "abc123",
  "createdAt": "2026-02-12T...",
  "updatedAt": "2026-02-12T..."
}
```

### 4. Atualizar URL
```http
PUT /shorten/:shortCode
Content-Type: application/json

{
  "url": "https://www.example.com/updated/url"
}
```
**Resposta (200):**
```json
{
  "id": "1",
  "url": "https://www.example.com/updated/url",
  "shortCode": "abc123",
  "createdAt": "2026-02-12T...",
  "updatedAt": "2026-02-12T..."
}
```

### 5. Deletar URL
```http
DELETE /shorten/:shortCode
```
**Resposta:** `204 No Content`

### 6. Obter Estatísticas
```http
GET /shorten/:shortCode/stats
```
**Resposta (200):**
```json
{
  "id": "1",
  "url": "https://www.example.com/very/long/url",
  "shortCode": "abc123",
  "createdAt": "2026-02-12T...",
  "updatedAt": "2026-02-12T...",
  "accessCount": 42
}
```

### 7. Redirecionar para URL Original
```http
GET /:shortCode
```
**Resposta:** `301 Moved Permanently` + redirect

---

## 🧪 Exemplos de Uso com PowerShell

### Criar URL Curta
```powershell
$body = @{ url = "https://github.com/GiovanaGuedesSilva" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/shorten" -Method POST -Body $body -ContentType "application/json"
Write-Host "Short Code: $($response.shortCode)"
```

### Obter Informações
```powershell
$code = "abc123"
$info = Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method GET
$info | ConvertTo-Json
```

### Atualizar URL
```powershell
$body = @{ url = "https://github.com/GiovanaGuedesSilva/url-shortener" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method PUT -Body $body -ContentType "application/json"
```

### Ver Estatísticas
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code/stats" -Method GET
```

### Deletar URL
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/shorten/$code" -Method DELETE
```

---

## 🔧 Configuração do Ambiente

Arquivo `.env`:
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

---

## 📊 Arquitetura

### Camadas da Aplicação
```
┌─────────────────────────────────────┐
│         Controller Layer            │  ← HTTP Requests/Responses
├─────────────────────────────────────┤
│          Service Layer              │  ← Business Logic + Cache
├─────────────────────────────────────┤
│        Repository Layer             │  ← Database Operations
├─────────────────────────────────────┤
│      Infrastructure Layer           │  ← PostgreSQL + Redis
└─────────────────────────────────────┘
```

### Fluxo de uma Requisição
1. **Cliente** faz requisição HTTP
2. **Controller** valida input (Zod)
3. **Service** verifica cache Redis
4. **Repository** busca/salva no PostgreSQL
5. **Service** atualiza cache
6. **Controller** retorna resposta

---

## 🎯 Próximos Passos

- [ ] Adicionar testes automatizados (Jest/Mocha)
- [ ] Implementar rate limiting
- [ ] Adicionar autenticação (JWT)
- [ ] Criar interface frontend
- [ ] Deploy em produção (Azure/AWS/Heroku)
- [ ] Adicionar monitoramento (Prometheus)
- [ ] Implementar analytics de acesso
- [ ] Adicionar validação de URLs customizadas

---

## 📝 Notas Importantes

1. **Cache Redis**: TTL de 24 horas para cada URL
2. **Contador de Acessos**: Incrementado automaticamente em cada redirect
3. **Códigos Únicos**: Gerados com nanoid (7 caracteres)
4. **Validação**: URLs devem ter no máximo 2048 caracteres
5. **Graceful Shutdown**: Servidor fecha conexões corretamente em SIGTERM/SIGINT

---

## 🐛 Troubleshooting

### Servidor não inicia
```powershell
# Verificar se porta 3000 está em uso
netstat -ano | findstr :3000

# Matar processos Node.js
Get-Process -Name node | Stop-Process -Force
```

### PostgreSQL não conecta
```powershell
# Verificar se PostgreSQL está rodando
Get-Service -Name postgresql*

# Testar conexão manual
psql -U postgres -d urlshortener -c "SELECT 1;"
```

### Redis não conecta
```powershell
# Verificar container
docker ps | findstr redis

# Ver logs
docker logs url-shortener-redis

# Reiniciar container
docker restart url-shortener-redis
```

---

## 👨‍💻 Autor

**Giovana Guedes**
- GitHub: [@GiovanaGuedesSilva](https://github.com/GiovanaGuedesSilva)
- Repository: [url-shortener](https://github.com/GiovanaGuedesSilva/url-shortener)

---

## 📄 Licença

MIT License - Veja o arquivo LICENSE para mais detalhes.

---

**🎉 Projeto configurado e funcionando com sucesso!**

Acesse: http://localhost:3000/health
