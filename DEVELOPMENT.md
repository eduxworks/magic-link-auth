# Guía de Desarrollo - Magic Link Auth

## Requisitos Previos

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose
- Git

## Setup Inicial

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd magic-link
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Crear archivo .env.local
```bash
cp .env.example .env.local
```

O manualmente crear `.env.local` con:
```env
MONGODB_URI=mongodb://admin:mongo_password_123@localhost:27018/magic-link?authSource=admin
MAILHOG_HOST=localhost
MAILHOG_PORT=1027
MAILHOG_FROM=noreply@magiclink.local
BASE_URL=http://localhost:3000
SECRET_KEY=your-super-secret-key-change-this-in-production
TOKEN_EXPIRY=15
```

### 4. Iniciar servicios Docker

#### Opción A: Docker individual

**MongoDB**
```bash
docker run -d \
  --name mongodb_cc \
  -p 27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo_password_123 \
  mongo:latest
```

**MailHog**
```bash
docker run -d \
  --name mailhog \
  -p 1027:1025 \
  -p 8025:8025 \
  mailhog/mailhog:latest
```

#### Opción B: Docker Compose (recomendado)

Crear `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb_cc
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: mongo_password_123
    ports:
      - "27018:27017"
    volumes:
      - mongo_data:/data/db

  mailhog:
    image: mailhog/mailhog:latest
    container_name: mailhog
    ports:
      - "1027:1025"
      - "8025:8025"

volumes:
  mongo_data:
```

Luego:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 5. Ejecutar aplicación

**Modo Desarrollo**
```bash
pnpm dev
```

Acceder a:
- Frontend: http://localhost:3000
- MailHog UI: http://localhost:8025

**Modo Producción**
```bash
pnpm build
pnpm start
```

## Flujo de Desarrollo

### Testing Manual Completo

1. **Abrir aplicación**
   ```
   http://localhost:3000
   ```

2. **Ir a login**
   ```
   Click en "Go to Login" o http://localhost:3000/login
   ```

3. **Ingresar email**
   ```
   Ejemplo: test@example.com
   ```

4. **Enviar formulario**
   ```
   Click en "Send Magic Link"
   Ver mensaje de confirmación
   ```

5. **Verificar email**
   ```
   Ir a http://localhost:8025
   Buscar email más reciente
   Ver el link dentro del email
   ```

6. **Hacer clic en link**
   ```
   Copiar link completo
   Pegar en navegador
   O click directo si funciona
   ```

7. **Verificar autenticación**
   ```
   Ver redirección a home
   Ver email autenticado
   Ver botón "Logout"
   ```

8. **Probar logout**
   ```
   Click en "Logout"
   Volver a "Not authenticated"
   localStorage debe estar vacío
   ```

### Testing de Errores

**Email Inválido**
```bash
# En form, ingresar:
test@
test
invalid.email

# Esperado: Error "Invalid email format"
```

**Token Expirado**
```bash
# Esperar 15 minutos después de generar magic link
# O editar TOKEN_EXPIRY=1 en .env.local
# Luego: Click en link expirado
# Esperado: Error "Invalid or expired token"
```

**Token Usado Dos Veces**
```bash
# Generar magic link
# Hacer clic en link (debería funcionar)
# Copiar mismo link y hacer clic de nuevo
# Esperado: Error "Invalid or expired token"
```

**Sin JWT**
```bash
# En DevTools > Console:
localStorage.removeItem('authToken')

# Ir a http://localhost:3000
# Esperado: "Not authenticated"
```

## Desarrollo

### Estructura de Carpetas
```
magic-link/
├── app/
│   ├── api/              # API Routes
│   ├── auth/             # Auth pages
│   ├── login/            # Login page
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/                  # Utilities & hooks
├── public/              # Static assets
├── .env.local           # Local env vars
├── README.md            # Main docs
├── RETROSPECTIVE.md     # Retrospective
└── DEVELOPMENT.md       # This file
```

### Agregar Nuevo Endpoint

1. **Crear archivo**
   ```bash
   touch app/api/ruta/nombre/route.ts
   ```

2. **Implementar handler**
   ```typescript
   export async function GET(request: Request) {
     // Tu código aquí
   }

   export async function POST(request: Request) {
     // Tu código aquí
   }
   ```

3. **Usar en cliente**
   ```typescript
   const response = await fetch('/api/ruta/nombre', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ /* data */ })
   });
   ```

### Agregar Nuevo Componente

1. **Crear archivo**
   ```bash
   touch components/NombreComponente.tsx
   ```

2. **Implementar componente**
   ```typescript
   export default function NombreComponente() {
     return <div>Content</div>;
   }
   ```

3. **Usar en página**
   ```typescript
   import NombreComponente from '@/components/NombreComponente';

   export default function Page() {
     return <NombreComponente />;
   }
   ```

### Modificar Base de Datos

**Colecciones se crean automáticamente**
Los índices se crean en `connectToDatabase()` → `ensureIndexes()`

Para agregar índice nuevo:
```typescript
// En lib/db.ts, agregar a ensureIndexes():
await collection.createIndex({ campo: 1 });
```

### Variables de Entorno

**Desarrollo**: `.env.local`
**Producción**: `.env.production`

Leer con:
```typescript
process.env.VARIABLE_NAME || 'default'
```

## Debugging

### Console Logs

**Backend**
```bash
# Los logs aparecen en terminal donde corre `pnpm dev`
console.log('Debug message')
```

**Frontend**
```bash
# DevTools > Console
console.log('Debug message')
```

### MongoDB Shell

```bash
# Conectar a MongoDB
mongosh -u admin -p mongo_password_123 --authenticationDatabase admin localhost:27018/magic-link

# Ver colecciones
db.getCollectionNames()

# Ver usuarios
db.users.find().pretty()

# Ver magic links
db.magic_links.find().pretty()

# Limpiar datos (development only!)
db.users.deleteMany({})
db.magic_links.deleteMany({})
```

### MailHog Web UI

```
http://localhost:8025
```

Ver:
- Todos los emails enviados
- HTML preview
- Raw message
- Headers

## Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar build producción
pnpm start

# Linting
pnpm lint

# Limpiar cache
rm -rf .next

# Reiniciar servicios Docker
docker restart mongodb_cc mailhog
```

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Verificar que MongoDB corre
docker ps | grep mongodb_cc

# Si no corre:
docker start mongodb_cc

# Verificar conexión
mongosh -u admin -p mongo_password_123 --authenticationDatabase admin localhost:27018
```

### "Email no se envía"
```bash
# Verificar MailHog corre
docker ps | grep mailhog

# Si no corre:
docker start mailhog

# Verificar en UI
http://localhost:8025

# Verificar logs
docker logs mailhog
```

### "TypeScript error"
```bash
# Build completo
pnpm build

# Ver errores específicos
```

### "Port already in use"
```bash
# Cambiar puerto en pnpm dev:
pnpm dev -- -p 3001

# O matar proceso
npx kill-port 3000
```

### "localStorage vacío"
```bash
# DevTools > Application > Storage > Local Storage
# Debe estar presente: authToken

# Si no:
# - User no authenticated
# - Algo falló en verify
```

## Performance

### Optimizaciones Implementadas
- ✅ Next.js built-in optimization
- ✅ JWT verification sin DB hit
- ✅ MongoDB indexes
- ✅ Connection pooling

### Mejoras Futuras
- Cache de usuarios frecuentes
- Redis para rate limiting
- CDN para assets
- Lazy loading de componentes

## Security Checklist

**Antes de Producción**
- [ ] Cambiar SECRET_KEY
- [ ] Usar credenciales reales MongoDB
- [ ] Usar HTTPS
- [ ] Configurar CORS
- [ ] Activar rate limiting
- [ ] Setup logging/monitoring
- [ ] Auditar dependencies
- [ ] Security headers

## CI/CD (Futuro)

```yaml
# .github/workflows/main.yml
name: Build & Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Nodemailer Docs](https://nodemailer.com/)
- [JWT.io](https://jwt.io)
- [MailHog](https://github.com/mailhog/MailHog)

---

*Última actualización: 2026-05-04*
