# Entrega Final — Backend II: Arquitectura, Patrones y Servicios

Proyecto backend de ecommerce profesional desarrollado con **Node.js**, **Express 5** y **MongoDB (Mongoose)**, evolucionado desde la Entrega N.º 1 para cumplir con todos los estándares y requerimientos de la **Entrega Final**.

---

## 🏛️ Arquitectura por Capas

El proyecto implementa una arquitectura desacoplada y orientada a capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Mongoose Model
```

Para la respuesta segura de usuarios al cliente:

```text
Model / Repository
       ↓
      DTO
       ↓
    Response
```

### Responsabilidades por Capa:
1. **Routes (`src/routes/`)**: Definición exclusiva de rutas, endpoints y middlewares de autenticación/autorización.
2. **Controllers (`src/controllers/`)**: Capa delgada encargada de recibir las peticiones (`req`), invocar los métodos del Service correspondiente y responder (`res`) con los códigos HTTP pertinentes. No importan modelos de Mongoose.
3. **Services (`src/services/`)**: Contiene toda la lógica de negocio del sistema: validaciones, propiedad de carritos, cálculo de totales, verificación de stock atómico, gestión de compras parciales/completas, emisión de tickets y flujo de recuperación de contraseña.
4. **Repositories (`src/repositories/`)**: Abstraen la persistencia de datos consumiendo los DAOs correspondientes. No interactúan con `req`/`res` ni con modelos Mongoose directos.
5. **DAOs (`src/daos/`)**: Capa exclusiva que interactúa directamente con los modelos de Mongoose para operaciones CRUD y atómicas sobre MongoDB.
6. **DTOs (`src/dtos/`)**: Transformación y filtrado de los datos que viajan hacia el cliente. El DTO de usuario (`user.dto.js`) elimina contraseñas, hashes, tokens y datos internos sensibles.
7. **Models (`src/models/`)**: Esquemas y modelos de persistencia Mongoose (`User`, `Product`, `Cart`, `Ticket`, `PasswordReset`).

---

## 🔐 Autenticación y Autorización

- **Passport Local**: Estrategias `register` y `login` gestionadas mediante `authService` y `usersRepository`.
- **Passport JWT**: Estrategia `current` que extrae el token desde la cookie `token_coder` (`httpOnly: true`) y recupera al usuario directamente desde la base de datos a través de `usersRepository.getById` para garantizar consistencia.
- **DTO en `/api/sessions/current`**: La información devuelta por `/current` se procesa estrictamente mediante `userDto.toCurrent(user)`, ocultando todo dato sensible.
- **Roles y Permisos**:
  - `admin`:
    - Creación, actualización y eliminación de productos (`POST`, `PATCH`, `DELETE` en `/api/products`).
    - Eliminación y listado de usuarios (`GET`, `DELETE` en `/api/users`).
    - No puede agregar productos a carritos protegidos para clientes.
  - `user`:
    - Agregar productos a **su propio** carrito (`POST /api/carts/:cid/product/:pid`).
    - Comprar **su propio** carrito (`POST /api/carts/:cid/purchase`).
    - No puede crear, modificar ni eliminar productos del catálogo.
    - Intentar interactuar con carritos de otros usuarios resulta en `403 Forbidden`.

---

## 🛒 Lógica de Compra y Modelo Ticket

### Flujo de Compra (`POST /api/carts/:cid/purchase`)
1. **Validación de Propiedad**: Se comprueba que el carrito pertenezca al usuario autenticado (`req.user`).
2. **Validación de Stock Atómico**: Para cada producto en el carrito, se decrementa el stock de forma atómica (`$inc: { stock: -quantity }` condicionado a `stock: { $gte: quantity }`), impidiendo inconsistencias o stock negativo.
3. **Manejo de Compra Completa**: Si todos los productos cuentan con stock, se descuenta el stock, se acumula el total (`amount`), se genera el Ticket y el carrito queda vacío.
4. **Manejo de Compra Parcial**: Si algunos productos no tienen stock suficiente:
   - Se descuenta el stock únicamente de los productos comprables.
   - El Ticket se genera **únicamente** por el importe de los productos efectivamente comprados.
   - Los productos no comprados **permanecen en el carrito** con su cantidad original.
   - La respuesta informa los ítems no procesados (`notProcessed`).
5. **Caso Sin Stock Disponible**: Si ningún producto puede comprarse, no se descuenta stock, no se modifica el carrito, **no se genera un ticket con importe 0** y se responde con `409 Conflict`.

### Esquema del Ticket (`src/models/ticket.model.js`)
- `code`: Identificador único generado mediante `crypto.randomUUID()`.
- `purchase_datetime`: Fecha y hora de emisión (`Date.now`).
- `amount`: Monto total facturado de los productos comprados.
- `purchaser`: Email del comprador.

---

## ✉️ Recuperación de Contraseña

1. **Solicitud (`POST /api/sessions/password-recovery`)**:
   - Recibe el email del usuario.
   - Genera un token único y seguro con `crypto.randomUUID()`.
   - Se persiste en MongoDB (`PasswordReset`) con vencimiento a **1 hora** (`Date.now() + 60 * 60 * 1000`).
   - Se despacha un correo con botón HTML apuntando a `${APP_URL}/reset-password?token=${token}` utilizando **Nodemailer** y plantilla dedicada (`src/templates/password-reset.template.js`).
2. **Formulario de Reseteo (`GET /reset-password?token=...`)**:
   - Renderiza la vista Handlebars `src/views/resetPassword.handlebars`.
3. **Restablecimiento Efectivo (`POST /api/sessions/reset-password`)**:
   - Valida que el token exista y que no haya expirado (`expiresAt > new Date()`).
   - Recupera al usuario con contraseña y valida mediante `isValidPassword(newPassword, user.password)` que la nueva contraseña **no sea idéntica a la anterior** (devuelve `400 Bad Request` si se intenta reutilizar).
   - Hashea la nueva contraseña con `createHash` y actualiza el usuario en la BD.
   - Elimina el token de la base de datos para impedir su reutilización (token de un solo uso).

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como plantilla `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=tu_clave_secreta

APP_URL=http://localhost:8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
GMAIL_USER=tu_email@gmail.com
GMAIL_PASS=tu_app_password
```

> **Aviso de seguridad:** El archivo `.env` contiene credenciales sensibles y se encuentra en `.gitignore`. No subir credenciales reales a repositorios públicos.

---

## 🚀 Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Modo Desarrollo (Nodemon):**
   ```bash
   npm run dev
   ```

3. **Modo Producción:**
   ```bash
   npm run prod
   ```

---

## 📌 Tabla de Endpoints

### 1. Sesiones y Autenticación (`/api/sessions`)

| Método | Ruta | Descripción | Acceso / Middleware |
|---|---|---|---|
| `POST` | `/api/sessions/register` | Registro de nuevo usuario y creación automática de su carrito | Público (`passportCall('register')`) |
| `POST` | `/api/sessions/login` | Inicio de sesión, devuelve cookie `token_coder` | Público (`passportCall('login')`) |
| `GET` | `/api/sessions/current` | Retorna el usuario autenticado filtrado por `userDto` | `passportCall('current')` |
| `GET` | `/api/sessions/logout` | Cierre de sesión y limpieza de cookie | Público |
| `POST` | `/api/sessions/password-recovery` | Envía correo con botón y enlace de reseteo válido por 1 hora | Público |
| `POST` | `/api/sessions/reset-password` | Valida token, no permite misma clave y actualiza contraseña | Público |

### 2. Productos (`/api/products`)

| Método | Ruta | Descripción | Acceso / Middleware |
|---|---|---|---|
| `GET` | `/api/products` | Lista todos los productos | Público |
| `GET` | `/api/products/:id` | Detalle de un producto por ID | Público |
| `POST` | `/api/products` | Crear nuevo producto | `passportCall('current')` + `authorize('admin')` |
| `PATCH` | `/api/products/:id` | Actualizar producto existente | `passportCall('current')` + `authorize('admin')` |
| `DELETE` | `/api/products/:id` | Eliminar producto | `passportCall('current')` + `authorize('admin')` |

### 3. Carrito y Compra (`/api/carts`)

| Método | Ruta | Descripción | Acceso / Middleware |
|---|---|---|---|
| `POST` | `/api/carts/:cid/product/:pid` | Agrega o incrementa producto en el carrito del usuario | `passportCall('current')` + `authorize('user')` + validación dueño |
| `POST` | `/api/carts/:cid/purchase` | Procesa la compra completa/parcial y genera Ticket | `passportCall('current')` + `authorize('user')` + validación dueño |

### 4. Usuarios (`/api/users`)

| Método | Ruta | Descripción | Acceso / Middleware |
|---|---|---|---|
| `GET` | `/api/users` | Lista todos los usuarios | `passportCall('current')` + `authorize('admin')` |
| `GET` | `/api/users/:uid` | Obtiene un usuario por ID | Público |
| `POST` | `/api/users` | Crea un usuario con carrito | Público |
| `PUT` | `/api/users/:uid` | Actualiza datos (no permite alterar role) | Público |
| `DELETE` | `/api/users/:uid` | Elimina usuario y su carrito asociado | `passportCall('current')` + `authorize('admin')` |

### 5. Vistas Web (`/`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Catálogo de productos |
| `GET` | `/login` | Formulario de login |
| `GET` | `/register` | Formulario de registro |
| `GET` | `/cart` | Vista de carrito |
| `GET` | `/reset-password?token=...` | Formulario para ingresar nueva contraseña |

---

## 🧪 Guía de Pruebas Manuales (cURL y Postman)

### 1. Registro y Login
```bash
# Registro
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Juan","last_name":"Perez","email":"juan@example.com","age":30,"password":"Password123!"}'

# Login
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"juan@example.com","password":"Password123!"}'
```

### 2. Validar DTO en `/current`
```bash
curl -X GET http://localhost:8080/api/sessions/current -b cookies.txt
```
*Respuesta esperada:* `200 OK` con `first_name`, `last_name`, `email`, `age`, `role`, `cart`, `id`. Sin contraseñas ni campos internos.

### 3. Autorización de Productos
```bash
# Intento de creación con usuario estándar (debe retornar 403 Forbidden)
curl -X POST http://localhost:8080/api/products \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Laptop Pro","price":1500,"stock":10,"category":"computacion"}'
```

### 4. Carrito y Manejo de Stock en Compra
```bash
# Agregar producto al propio carrito
curl -X POST http://localhost:8080/api/carts/<CART_ID>/product/<PRODUCT_ID> -b cookies.txt

# Finalizar compra
curl -X POST http://localhost:8080/api/carts/<CART_ID>/purchase -b cookies.txt
```
*Respuesta esperada:* `200 OK` con el comprobante de `Ticket` emitido y el array de productos `notProcessed` (en caso de compra parcial).
