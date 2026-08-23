# Entrega N.º 1 — Backend II: Diseño y Arquitectura Backend

Proyecto backend de ecommerce desarrollado sobre Node.js y Express, con persistencia en MongoDB (Mongoose), autenticación basada en JWT con Passport, autorización por roles y CRUD de usuarios.

---

## 📋 Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **MongoDB**: Instancia local o remota (MongoDB Atlas) en ejecución

---

## 🚀 Instalación

1. Clonar el repositorio o posicionarse en la carpeta raíz del proyecto.
2. Instalar las dependencias necesarias:

```bash
npm install
```

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=coderSecretKey123
```

> **Nota de seguridad:** El archivo `.env` contiene información sensible y se encuentra ignorado en `.gitignore`, por lo que no está incluido en el repositorio.

---

## ▶️ Ejecución

### Modo Desarrollo (con Nodemon):

```bash
npm run dev
```

### Modo Producción:

```bash
npm run prod
```

El servidor quedará escuchando en `http://localhost:8080`.

---

## 📌 Endpoints Principales

### 1. Autenticación y Sesiones (`/api/sessions`)

| Método | Endpoint | Descripción | Autenticación / Roles |
|---|---|---|---|
| `POST` | `/api/sessions/register` | Registra un nuevo usuario con carrito asociado (rol `user` por defecto) | Público |
| `POST` | `/api/sessions/login` | Inicia sesión y genera cookie `HttpOnly` (`token_coder`) | Público |
| `GET` | `/api/sessions/current` | Devuelve los datos del usuario autenticado | Requiere JWT (`passportCall('current')`) |
| `GET` | `/api/sessions/logout` | Cierra la sesión y limpia la cookie | Público |

### 2. CRUD de Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Autenticación / Roles |
|---|---|---|---|
| `GET` | `/api/users` | Obtiene la lista completa de usuarios | Solo `admin` |
| `GET` | `/api/users/:uid` | Obtiene un usuario específico por su `_id` | Público |
| `POST` | `/api/users` | Crea un usuario y asocia su carrito (rol `user` por defecto) | Público |
| `PUT` | `/api/users/:uid` | Actualiza los datos de un usuario (hashea nuevo password si se envía) | Público |
| `DELETE` | `/api/users/:uid` | Elimina un usuario y su carrito asociado | Solo `admin` |

---

## 🧪 Guía de Pruebas

### 1. Probar Registro de Usuario
**POST** `http://localhost:8080/api/sessions/register`  
`Content-Type: application/json`

```json
{
  "first_name": "Diego",
  "last_name": "Perez",
  "email": "diego@test.com",
  "age": 25,
  "password": "coderPassword123"
}
```
- **Respuesta esperada:** Status `201 Created` con los datos del usuario creado (sin incluir el campo `password`), con rol `user` por defecto y su referencia `cart` asignada.
- **Validación de duplicados:** Si se intenta registrar el mismo email, devuelve status `401`/`409` con mensaje de usuario existente.

---

### 2. Probar Login
**POST** `http://localhost:8080/api/sessions/login`  
`Content-Type: application/json`

```json
{
  "email": "diego@test.com",
  "password": "coderPassword123"
}
```
- **Respuesta esperada:** Status `200 OK` y cookie `token_coder` establecida como `HttpOnly`.
- **Credenciales inválidas:** Con contraseña errónea devuelve `401 Unauthorized`.

---

### 3. Probar `/api/sessions/current`

#### Con Token Válido (Autenticado):
**GET** `http://localhost:8080/api/sessions/current` (enviando la cookie `token_coder` recibida en el login)
- **Respuesta esperada:** Status `200 OK` con el payload de datos del usuario autenticado sin la contraseña:
```json
{
  "status": "success",
  "payload": {
    "first_name": "Diego",
    "last_name": "Perez",
    "email": "diego@test.com",
    "age": 25,
    "cart": "64f1...",
    "role": "user"
  }
}
```

#### Sin Token (No Autenticado):
**GET** `http://localhost:8080/api/sessions/current` (sin cookies)
- **Respuesta esperada:** Status `401 Unauthorized` con `{ "status": "error", "message": "No auth token" }`.

#### Con Token Inválido o Adulterado:
**GET** `http://localhost:8080/api/sessions/current` (con cookie `token_coder=tokenInvalido`)
- **Respuesta esperada:** Status `401 Unauthorized` rechazada por Passport JWT.

---

### 4. Probar CRUD de Usuarios

- **GET `/api/users/:uid`**: Obtiene el usuario indicado. Devuelve `404 Not Found` si el ID no existe.
- **POST `/api/users`**: Crea un usuario con rol `user` por defecto, hasheando la contraseña con `createHash` y vinculando un nuevo `cart`.
- **PUT `/api/users/:uid`**: Actualiza campos (el campo `role` no puede ser modificado por este medio). Si se incluye `"password"`, este es hasheado automáticamente antes de persistir.
- **DELETE `/api/users/:uid`**: Elimina el usuario y su carrito. Requiere rol `admin`.

---

### 5. Probar Autorización por Rol

1. **Usuario con rol `user`:**
   - Iniciar sesión con un usuario estándar.
   - Intentar ejecutar `DELETE http://localhost:8080/api/users/<uid>` o `GET http://localhost:8080/api/users`.
   - **Resultado:** Status `403 Forbidden` (`No tiene permisos para acceder a este recurso`).
2. **Usuario con rol `admin`:**
   - Modificar manualmente el campo `role` a `"admin"` en el documento del usuario en MongoDB.
   - Iniciar sesión nuevamente con las credenciales de ese usuario para obtener una nueva cookie/JWT con el rol actualizado.
   - Ejecutar `GET http://localhost:8080/api/users` o `DELETE http://localhost:8080/api/users/<uid>`.
   - **Resultado:** Status `200 OK` con acceso permitido.
