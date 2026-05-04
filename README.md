# Magic Link Authentication System

Sistema de autenticación sin contraseña basado en Next.js, MongoDB y MailHog.

## Características

- ✅ Autenticación sin contraseña mediante magic links
- ✅ Integración con MongoDB para persistencia
- ✅ Envío de emails con MailHog
- ✅ JWT almacenado en localStorage
- ✅ Expiración automática de tokens
- ✅ API segura

## Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Driver Nativo)
- **Email**: MailHog SMTP

## Estructura

```
magic-link/
├── app/
│   ├── api/auth/
│   │   ├── request-link/route.ts    # Solicitar magic link
│   │   ├── verify-link/route.ts     # Verificar token
│   │   └── me/route.ts              # Usuario actual
│   ├── auth/verify/page.tsx         # Verificación
│   ├── login/page.tsx               # Login
│   └── page.tsx                     # Home
├── components/
│   ├── LoginForm.tsx
│   ├── AuthStatus.tsx
│   └── VerifyToken.tsx
├── lib/
│   ├── db.ts                        # MongoDB
│   ├── email.ts                     # MailHog
│   ├── auth.ts                      # Lógica auth
│   ├── hooks.ts                     # useAuth hook
│   └── types.ts                     # TypeScript types
└── .env.local
```

## Flujo de Autenticación

```
Usuario → Login → Request Link → Email enviado → Clic en Link → 
Verificación → JWT en localStorage → Autenticado
```

## Setup

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Variables de entorno (.env.local)
```env
MONGODB_URI=mongodb://admin:mongo_password_123@localhost:27018/magic-link?authSource=admin
MAILHOG_HOST=localhost
MAILHOG_PORT=1027
MAILHOG_FROM=noreply@magiclink.local
BASE_URL=http://localhost:3000
SECRET_KEY=your-secret-key
TOKEN_EXPIRY=15
```

### 3. Iniciar Docker services
```bash
# MongoDB
docker run -d --name mongodb_cc -p 27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo_password_123 mongo

# MailHog
docker run -d --name mailhog -p 1027:1025 -p 8025:8025 mailhog/mailhog
```

### 4. Ejecutar aplicación
```bash
pnpm dev
```

- Frontend: http://localhost:3000
- MailHog UI: http://localhost:8025

## API Endpoints

- **POST** `/api/auth/request-link` - Solicitar magic link
- **GET** `/api/auth/verify-link?token=X&email=Y` - Verificar token
- **GET** `/api/auth/me` - Obtener usuario (requiere JWT)

## Base de Datos

### Colección: users
```javascript
{
  _id: ObjectId,
  email: string,
  createdAt: Date,
  lastLoginAt: Date
}
```

### Colección: magic_links
```javascript
{
  _id: ObjectId,
  token: string,
  email: string,
  expiresAt: Date,
  used: boolean
}
```

Índices:
- `users.email` (único)
- `magic_links.token`
- `magic_links.email`
- `magic_links.expiresAt` (TTL)

## Seguridad

- ✅ JWT con HMAC-SHA256
- ✅ Validación de email
- ✅ Expiración 15 minutos
- ✅ Tokens de un solo uso
- ✅ localStorage para persistencia

## Componentes

- **LoginForm**: Solicitar magic link
- **AuthStatus**: Estado del usuario
- **VerifyToken**: Verificar link del email

## Hook

```typescript
const { user, loading, error, logout } = useAuth();
```

## Retrospectiva

### Alcanzado
✅ Sistema passwordless funcional
✅ MongoDB integrado
✅ MailHog configurado
✅ JWT en localStorage
✅ API segura
✅ UI responsiva

### Mejoras Futuras
- HTTPOnly cookies
- Refresh tokens
- Rate limiting
- 2FA
- OAuth/OIDC
- Auditoría de logins

### Cambios para Producción
- Generar SECRET_KEY fuerte
- MONGODB_URI con credenciales reales
- Usar HTTPS
- SMTP real (SendGrid, AWS SES)
- CORS restringido

## Testing

1. Ir a http://localhost:3000/login
2. Ingresar email
3. Abrir http://localhost:8025
4. Hacer clic en link
5. Ser redirigido autenticado

---

Proyecto educativo - libre para usar y modificar
