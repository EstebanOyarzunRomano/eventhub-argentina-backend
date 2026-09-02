# EventHub Argentina - Backend II

API REST desarrollada con Node.js, Express, MongoDB y Mongoose para una plataforma de eventos e inscripciones.

Actualmente el proyecto incluye una arquitectura organizada en capas, persistencia en MongoDB, registro seguro de usuarios, autenticación centralizada con Passport.js y un sistema de autorización basado en roles.

La autenticación utiliza JSON Web Tokens (JWT) almacenados en una cookie HTTP Only. La autorización diferencia los permisos de los roles `user`, `organizer` y `admin`, e incorpora validación de propiedad para los eventos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcrypt
- JSON Web Token
- cookie-parser
- dotenv
- Passport.js
- passport-local
- passport-jwt
- passport-custom
- Nodemailer

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/EstebanOyarzunRomano/eventhub-argentina-backend.git
```

Ingresar al proyecto:

```bash
cd eventhub-argentina-backend
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGO_URL=mongodb://localhost:27017/eventhub
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Por defecto, la API estará disponible en:

```text
http://localhost:8080
```

## Variables de entorno

| Variable         | Descripción                                   |
| ---------------- | --------------------------------------------- |
| `PORT`           | Puerto utilizado por el servidor              |
| `MONGO_URL`      | URL de conexión a MongoDB                     |
| `JWT_SECRET`     | Clave utilizada para firmar y validar los JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT                  |
| `NODE_ENV`       | Entorno de ejecución de la aplicación         |

El archivo `.env` contiene información sensible y no se incluye en el repositorio.

El archivo `.env.example` sirve como referencia para configurar las variables necesarias.

## Arquitectura

La aplicación está organizada por capas:

```text
src/
├── config/
├── controllers/
├── dao/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

La autenticación se encuentra centralizada en:

```text
src/config/passport.config.js
```

Esto permite mantener las estrategias de Passport separadas de la configuración principal de Express.

La autenticación y autorización de rutas se implementan mediante middlewares reutilizables:

```text
src/middlewares/auth.middleware.js
src/middlewares/authorize.middleware.js
```

## Autenticación con Passport.js

Passport.js centraliza la autenticación mediante tres estrategias:

### Estrategia `register`

Se utiliza para registrar nuevos usuarios.

La estrategia se encarga de:

* Validar los campos obligatorios.
* Normalizar el email.
* Validar el formato del email.
* Validar la longitud mínima de la contraseña.
* Comprobar que el email no se encuentre registrado.
* Hashear la contraseña utilizando bcrypt.
* Crear el usuario en MongoDB.
* Evitar que el rol pueda ser manipulado desde el registro público.

El rol por defecto es:

```text
user
```



### Estrategia `login`

Se utiliza para validar las credenciales del usuario.

La estrategia:

* Normaliza el email.
* Busca el usuario registrado.
* Compara la contraseña mediante bcrypt.
* Devuelve un mensaje genérico ante credenciales inválidas.

Passport únicamente valida las credenciales.

Después de una autenticación exitosa, el controller genera el JWT y lo almacena en la cookie:

```text
currentUser
```

La cookie se configura con `httpOnly: true`.

### Estrategia `current`

Se utiliza para validar la sesión actual.

La estrategia:

* Obtiene el JWT desde la cookie `currentUser`.
* Verifica la firma y validez del token.
* Deja los datos autenticados disponibles en `req.user`.

La respuesta únicamente expone:

```json
{
  "id": "user_id",
  "email": "usuario@mail.com",
  "role": "user"
}
```
La contraseña nunca se incluye en el JWT ni en la respuesta de `/current`.

## Roles y autorización

El sistema implementa tres roles:

- `user`: usuario estándar de la plataforma.
- `organizer`: usuario autorizado para crear y administrar sus propios eventos.
- `admin`: usuario con permisos administrativos y capacidad para administrar cualquier evento.

El registro público siempre crea usuarios con rol `user`. El campo `role` enviado desde el body del registro es ignorado, evitando la creación pública de usuarios `organizer` o `admin`.

### Matriz de permisos

| Acción | user | organizer | admin |
| --- | :---: | :---: | :---: |
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar eventos ajenos | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

### Autenticación y autorización

Las rutas protegidas utilizan dos niveles de control:

1. `authenticate`: verifica que exista una sesión válida y carga los datos del JWT en `req.user`.
2. `authorize(...roles)`: comprueba que el rol del usuario autenticado se encuentre entre los roles permitidos.

Esto permite mantener la autenticación y la autorización separadas de la definición de las rutas.

## Rutas

### Health check

```http
GET /api/health
```

Permite comprobar el estado básico de la API.

---

## Sesiones

### Registrar usuario

```http
POST /api/sessions/register
```

Ejemplo de body:

```json
{
  "first_name": "Lucia",
  "last_name": "Fernandez",
  "email": "lucia.fernandez@mail.com",
  "password": "123456"
}
```

El registro público siempre asigna el rol `user`.

El campo `role` no puede ser definido desde el body.

### Iniciar sesión

```http
POST /api/sessions/login
```

Ejemplo:

```json
{
  "email": "lucia.fernandez@mail.com",
  "password": "123456"
}
```

Si las credenciales son correctas, el controller genera un JWT y establece la cookie HTTP Only `currentUser`.

### Usuario actual

```http
GET /api/sessions/current
```

Requiere una cookie `currentUser` con un JWT válido.

Ejemplo de respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "user_id",
    "email": "lucia.fernandez@mail.com",
    "role": "user"
  }
}
```

### Cerrar sesión

```http
POST /api/sessions/logout
```

Elimina la cookie `currentUser`.

---

## Eventos

Los eventos constituyen la entidad principal de la plataforma.

Cada evento contiene los siguientes campos:

- `title`
- `description`
- `category`
- `date`
- `location`
- `capacity`
- `price`
- `status`
- `organizer`

El campo `organizer` almacena una referencia `ObjectId` al usuario que creó el evento.

Los estados permitidos son:

- `draft`
- `published`
- `cancelled`
- `finished`

### Crear evento

```http
POST /api/events
```

**Acceso:** `organizer` y `admin`.

Ejemplo:

```json
{
  "title": "Workshop de React",
  "description": "Taller práctico de React para desarrolladores",
  "category": "workshop",
  "date": "2026-10-20T18:00:00.000Z",
  "location": "Río Grande",
  "capacity": 40,
  "price": 18000,
  "status": "draft"
}
```

El campo `organizer` no se recibe desde el cliente.

Se asigna automáticamente utilizando el usuario autenticado:

```js
organizer: req.user.id
```

Reglas principales:

- La fecha debe ser futura.
- `capacity` debe ser mayor a `0`.
- `price` debe ser mayor o igual a `0`.
- Un evento nuevo no puede crearse como `cancelled` o `finished`.
- El organizer no puede establecerse manualmente desde el body.

Una creación exitosa devuelve `201 Created`.

### Listar eventos

```http
GET /api/events
```

**Acceso:** público.

El listado utiliza paginación y permite aplicar filtros y ordenamiento.

Filtros disponibles:

| Parámetro | Descripción |
| --- | --- |
| `status` | Filtra por estado |
| `category` | Filtra por categoría |
| `location` | Filtra por ubicación |
| `dateFrom` | Fecha mínima |
| `dateTo` | Fecha máxima |
| `page` | Página solicitada |
| `limit` | Cantidad de resultados por página |
| `sort` | Campo utilizado para ordenar |

Ejemplo:

```http
GET /api/events?status=published&category=workshop&page=2&limit=5
```

Ejemplo utilizando ubicación, rango de fechas y ordenamiento:

```http
GET /api/events?location=Río%20Grande&dateFrom=2026-09-01&dateTo=2026-12-31&sort=date&page=1&limit=5
```

El ordenamiento ascendente puede realizarse con:

```text
sort=date
```

y descendente con:

```text
sort=-date
```

La respuesta tiene la siguiente estructura:

```json
{
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

### Consultar evento por ID

```http
GET /api/events/:id
```

**Acceso:** público.

Devuelve el evento correspondiente al identificador solicitado.

Si el evento no existe:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

con estado HTTP `404 Not Found`.

### Modificar evento

```http
PUT /api/events/:id
```

**Acceso:** dueño del evento o `admin`.

Reglas:

- Un `organizer` solamente puede modificar sus propios eventos.
- Un `admin` puede modificar cualquier evento.
- Un evento `cancelled` no puede modificarse.
- El campo `organizer` no puede modificarse desde el body.
- El estado se modifica mediante el endpoint específico de estados.
- `capacity` debe ser mayor a `0`.
- `price` debe ser mayor o igual a `0`.
- Si se modifica la fecha, debe continuar siendo futura.

### Cambiar estado de un evento

```http
PATCH /api/events/:id/status
```

**Acceso:** dueño del evento o `admin`.

Ejemplo:

```json
{
  "status": "published"
}
```

Estados permitidos:

```text
draft
published
cancelled
finished
```

Cancelar un evento significa cambiar su estado a:

```text
cancelled
```

Los eventos no se eliminan físicamente de la base de datos.

Una vez que un evento se encuentra `cancelled`, su estado no puede volver a modificarse.

Tampoco se permite publicar un evento que ya haya finalizado.

---

## Reglas de negocio de eventos

La lógica de negocio se encuentra implementada en la capa `services`.

Las principales reglas son:

- No se pueden crear eventos con fecha pasada.
- La capacidad debe ser mayor a `0`.
- El precio debe ser mayor o igual a `0`.
- El organizador se obtiene automáticamente desde el usuario autenticado.
- Un organizer no puede modificar eventos pertenecientes a otro organizer.
- Un admin puede modificar eventos de cualquier organizer.
- Los eventos cancelados no pueden modificarse.
- Los eventos no se eliminan físicamente.
- No se pueden publicar eventos finalizados o cancelados.
- El cambio de estado se realiza mediante un endpoint específico.

De esta manera, los controllers se limitan al manejo de `request` y `response`, mientras que las reglas del dominio permanecen en los services y el acceso a MongoDB se mantiene en repositories/DAO.

---

## Usuarios - Ruta administrativa

```http
GET /api/users
```

**Acceso:** `admin`.

Permite obtener la lista de usuarios registrados.

Los usuarios con rol `user` u `organizer` no tienen acceso a esta ruta.

La respuesta no incluye contraseñas ni hashes.

---

## Propiedad de eventos

Cada evento almacena el identificador de su creador mediante una referencia:

```js
organizer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

No se almacena el objeto completo del usuario dentro del evento.

Los permisos sobre el recurso se aplican de la siguiente manera:

- `user`: no puede crear ni modificar eventos.
- `organizer`: puede crear eventos y modificar únicamente los propios.
- `admin`: puede crear y modificar cualquier evento.

La autenticación y autorización general se realizan mediante middlewares, mientras que la comprobación de propiedad del evento se realiza en la capa de servicios.

## Diferencia entre 401 y 403

### 401 Unauthorized

Se utiliza cuando el cliente no posee una sesión válida.

Ejemplos:

- No existe la cookie `currentUser`.
- El JWT es inválido.
- El JWT expiró.

Respuesta:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### 403 Forbidden

Se utiliza cuando el usuario está autenticado, pero no tiene permisos suficientes para realizar la operación.

Ejemplos:

- Un `user` intenta crear un evento.
- Un `organizer` intenta acceder a una ruta exclusiva de admin.
- Un `organizer` intenta modificar un evento perteneciente a otro organizer.

Ejemplo:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

### Eventos
#### Consultar eventos

```http
GET /api/events
```

Endpoint base correspondiente al recurso de eventos.

#### Registrar usuarios

```http
POST /api/sessions/register
```

Ejemplo de body:

```json
{
  "first_name": "Lucia",
  "last_name": "Fernandez",
  "email": "lucia.fernandez@mail.com",
  "password": "123456"
}
```

#### Crear evento
```http
POST /api/events
```

Requiere autenticación y rol organizer o admin.


Ejemplo de body:
```json
{
  "title": "Congreso Tech 2026",
  "description": "Evento sobre tecnología y desarrollo de software",
  "category": "Tecnología",
  "date": "2026-10-15T18:00:00.000Z",
  "location": "Río Grande, Tierra del Fuego",
  "capacity": 150
}
```

El campo `organizer` no se recibe desde el cliente. Se obtiene automáticamente desde req.user.id.

Una creación exitosa devuelve `201 Created`.

#### Modificar evento
```http
PUT /api/events/:eid
```

Requiere autenticación y rol organizer o admin.

Un organizer solamente puede modificar eventos que le pertenezcan.

Un admin puede modificar cualquier evento.

Si un organizer intenta modificar un evento perteneciente a otro usuario, la API devuelve 403 Forbidden.

```markdown
### Usuarios - Ruta administrativa

```http
GET /api/users
```

Requiere autenticación y rol `admin`.

Permite obtener la lista de usuarios registrados.

Los usuarios con rol `user` u `organizer` no tienen acceso a esta ruta.

La respuesta no incluye las contraseñas ni sus hashes.

Si un usuario autenticado sin rol `admin` intenta acceder:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

La respuesta utiliza el estado HTTP `403 Forbidden`.

## Propiedad de eventos

Cada evento almacena el identificador del usuario que lo creó mediante el campo `organizer`.

Al crear un evento, el backend obtiene automáticamente el propietario desde el usuario autenticado:

```js
organizer: req.user.id
```

Para modificar eventos se aplican las siguientes reglas:

- `organizer`: puede modificar únicamente sus propios eventos.
- `admin`: puede modificar cualquier evento.
- `user`: no puede modificar eventos.

Si un `organizer` intenta modificar un evento perteneciente a otro usuario, la API devuelve `403 Forbidden`.

Además, el campo `organizer` no puede modificarse mediante el body de una actualización. El servicio utiliza una lista de campos permitidos para evitar la modificación de propiedades sensibles como `organizer` o `_id`.

### Iniciar sesión

```http
POST /api/sessions/login
```

Ejemplo:

```json
{
  "email": "lucia.fernandez@mail.com",
  "password": "123456"
}
```

Si las credenciales son correctas, el controller genera un JWT y establece la cookie HTTP Only `currentUser`.

Respuesta:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

### Usuario actual

```http
GET /api/sessions/current
```

Requiere una cookie `currentUser` con un JWT válido.

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "user_id",
    "email": "lucia.fernandez@mail.com",
    "role": "user"
  }
}
```

Si no existe un token válido:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

con estado HTTP `401 Unauthorized`.

### Cerrar sesión

```http
POST /api/sessions/logout
```

Elimina la cookie `currentUser`.

Respuesta:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

La ruta de logout no requiere autenticación mediante Passport.

## Flujo de autenticación

El flujo principal es:

```text
Registro
   ↓
POST /api/sessions/register
   ↓
Passport: register
   ↓
Usuario almacenado en MongoDB
   ↓
Login
   ↓
POST /api/sessions/login
   ↓
Passport: login
   ↓
Controller genera JWT
   ↓
Cookie currentUser
   ↓
GET /api/sessions/current
   ↓
Passport: current
   ↓
req.user
   ↓
Datos del usuario
```

## Seguridad

El sistema implementa las siguientes medidas:

* Contraseñas hasheadas mediante bcrypt.
* Normalización de emails.
* Validación de usuarios duplicados.
* Rol por defecto `user`.
* El rol no puede manipularse desde el registro público.
* JWT firmado mediante una clave almacenada en variables de entorno.
* JWT almacenado en una cookie HTTP Only.
* La contraseña no se devuelve en las respuestas.
* Credenciales inválidas utilizan un mensaje genérico.
* Rutas protegidas rechazan tokens ausentes o inválidos.
* `.env` y `node_modules` se encuentran excluidos del repositorio.
* Autenticación mediante middleware reutilizable.
* Autorización basada en roles.
* Diferenciación entre errores `401 Unauthorized` y `403 Forbidden`.
* Validación de propiedad de eventos.
* Los organizers solamente pueden modificar sus propios eventos.
* Las rutas administrativas están restringidas al rol `admin`.
* La ruta administrativa de usuarios excluye el campo `password`.

## Preparación para providers externos

Las estrategias de Passport se encuentran centralizadas en `src/config/passport.config.js`.

Esta estructura permite incorporar en el futuro nuevas estrategias de autenticación, por ejemplo:

* Google
* GitHub

Estas estrategias pueden agregarse en la configuración de Passport sin incorporar su lógica directamente en `app.js`.

De esta manera, `app.js` se mantiene desacoplado de las estrategias específicas de autenticación.

## Pruebas realizadas

Antes de la entrega se verificaron los siguientes casos:

1. Registro exitoso.
2. Login exitoso y creación de la cookie `currentUser`.
3. Acceso a `/current` con JWT válido.
4. Logout y eliminación de la cookie.
5. Acceso a `/current` después del logout devuelve `401`.
6. Registro con email duplicado devuelve `409`.
7. Login con credenciales inválidas devuelve `401`.
8. Acceso a `/current` con JWT inválido o manipulado devuelve `401`.
9. Acceso a una ruta privada sin cookie devuelve `401`.
10. Usuario con rol `user` intentando crear un evento devuelve `403`.
11. Usuario con rol `organizer` puede crear un evento y obtiene `201`.
12. Usuario con rol `organizer` intentando acceder a la ruta administrativa devuelve `403`.
13. Usuario con rol `admin` puede acceder a `GET /api/users` y obtiene `200`.
14. `GET /api/users` no expone el campo `password`.
15. Organizer intentando modificar un evento ajeno devuelve `403`.
16. Organizer modificando un evento propio obtiene `200`.
17. Crear evento con rol `user` devuelve `403`.
18. Crear evento con fecha pasada devuelve `400`.
19. Crear evento con `capacity: 0` devuelve `400`.
20. Crear evento con `price` negativo devuelve `400`.
21. Organizer modificando un evento propio obtiene `200`.
22. Organizer intentando modificar un evento ajeno devuelve `403`.
23. Admin modificando un evento perteneciente a otro organizer obtiene `200`.
24. Cambiar el estado de un evento a `cancelled` obtiene `200`.
25. Intentar cambiar nuevamente el estado de un evento cancelado devuelve `400`.
26. Listado con filtros por `status` y `category`, junto con paginación, devuelve correctamente `data`, `page`, `limit`, `total` y `totalPages`.
27. Listado con filtros por ubicación y rango de fechas funciona correctamente.
28. Ordenamiento de eventos mediante `sort=date` funciona correctamente.
29. Consultar un evento inexistente devuelve `404`.

## Autor

Esteban Oyarzun Romano

Proyecto desarrollado para Backend II.

