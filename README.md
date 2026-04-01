# InterviewMate Frontend

Frontend en React + TypeScript + Vite para InterviewMate.

## Configuración rápida

1. Copia variables de entorno:

- `cp .env.example .env`

2. Define la URL del backend en `.env`:

- Local: `VITE_API_URL=http://localhost:8080`
- Render: `VITE_API_URL=https://interviewmate-0-0-5-alpha.onrender.com`

3. Instala dependencias y ejecuta:

- `npm install`
- `npm run dev`

## Variables de entorno frontend

- `VITE_API_URL`: base URL del backend.
- `VITE_USE_CREDENTIALS`: `true/false` para enviar cookies cross-site (si usas sesión/cookies).
- `VITE_GOOGLE_OAUTH_START_PATH`: endpoint de inicio OAuth2 (default: `/auth/oauth2/google`).

## Integración backend esperada

### Auth

- `POST /auth/register` (sin wrapper `ApiResponse<T>`)
- `POST /auth/login` (sin wrapper `ApiResponse<T>`)
- `GET /auth/me` (protegido con `Authorization: Bearer <jwt>`)

### Study

- `POST /study/start`
- `POST /study/generate-questions`
- `GET /study/{id}`

### Interview

- `POST /api/v1/interview-templates`
- `GET /api/v1/interview-templates`
- `PATCH /api/v1/interview-templates/{templateId}`
- `PATCH /api/v1/interview-templates/{templateId}/status?newStatus=ACTIVE`
- `POST /api/v1/sessions`
- `PATCH /api/v1/sessions/{sessionId}/begin`
- `PATCH /api/v1/sessions/{sessionId}/complete`
- `GET /api/v1/questions/session/{sessionId}`
- `PATCH /api/v1/questions/{questionId}/answer`
- `GET /api/v1/results/session/{sessionId}`

## OAuth2 Google

El login con Google redirige a:

- `${VITE_API_URL}${VITE_GOOGLE_OAUTH_START_PATH}`

El backend gestiona el resto del flujo OAuth2.

## Deploy en Vercel

Incluye configuración SPA en [vercel.json](vercel.json).

Para evitar CORS:

- Verifica que `VITE_API_URL` apunte al backend correcto.
- En backend, configura `CORS_ALLOWED_ORIGINS` con tu dominio Vercel exacto.
- Usa `Authorization: Bearer <jwt>` en endpoints protegidos.
