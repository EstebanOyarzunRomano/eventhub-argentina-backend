# EventHub Argentina - Backend II

API REST desarrollada con Node.js, Express, MongoDB y Mongoose para una plataforma de eventos e inscripciones.

El proyecto implementa una arquitectura profesional organizada en capas utilizando **DAO, Repository, Service, Controller y DTO**, separando el acceso a datos, la lógica de negocio y la representación de las respuestas de la API.

La plataforma permite registrar y autenticar usuarios, administrar eventos según roles, realizar inscripciones mediante tickets, controlar cupos, cancelar inscripciones y enviar notificaciones por correo electrónico.

La autenticación se realiza con Passport.js y JSON Web Tokens (JWT) almacenados en una cookie HTTP Only.

---

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

---

# Instalación

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
NODE_ENV=development

MONGO_URL=tu_url_de_conexion_a_mongodb

JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email
MAIL_PASS=tu_password_de_aplicacion
MAIL_FROM=tu_email
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Por defecto, la API estará disponible en:

```text
http://localhost:8080
```

---

# Variables de entorno

El proyecto utiliza variables de entorno para evitar almacenar credenciales y configuraciones sensibles directamente en el código.

El archivo `.env.example` incluye:

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto en el que se ejecuta el servidor |
| `MONGO_URL` | URL de conexión a MongoDB |
| `JWT_SECRET` | Clave utilizada para firmar los JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT |
| `NODE_ENV` | Entorno de ejecución |
| `MAIL_HOST` | Servidor SMTP |
| `MAIL_PORT` | Puerto del servidor SMTP |
| `MAIL_USER` | Usuario utilizado para enviar emails |
| `MAIL_PASS` | Contraseña o clave de aplicación |
| `MAIL_FROM` | Dirección utilizada como remitente |

El archivo `.env` real no debe subirse al repositorio.

---

# Arquitectura

La aplicación utiliza una arquitectura organizada en capas para separar responsabilidades y reducir el acoplamiento entre la lógica de negocio, la persistencia y la capa HTTP.

```text
src/
├── config/
├── controllers/
├── dao/
│   ├── users.dao.js
│   ├── events.dao.js
│   └── tickets.dao.js
├── dto/
│   ├── user.dto.js
│   ├── event.dto.js
│   └── ticket.dto.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── errorHandler.js
├── models/
│   ├── user.js
│   ├── event.js
│   └── ticket.js
├── repositories/
│   ├── users.repository.js
│   ├── events.repository.js
│   └── tickets.repository.js
├── routes/
├── services/
│   ├── sessions.service.js
│   ├── events.service.js
│   ├── tickets.service.js
│   └── mail.service.js
├── utils/
├── app.js
└── server.js
```

El flujo principal de una petición es:

```text
Request
   ↓
Router
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
   ↓
MongoDB
```

Las respuestas de usuario, evento y ticket son transformadas mediante DTO antes de enviarse al cliente.

---

# DAO

La capa **DAO (Data Access Object)** concentra el acceso directo a MongoDB mediante los modelos de Mongoose.

Existen DAO para las entidades principales:

```text
users.dao.js
events.dao.js
tickets.dao.js
```

Los DAO son los únicos componentes de la arquitectura que importan directamente los modelos de Mongoose.

Exponen operaciones de persistencia como:

```text
findById()
findOne()
find()
create()
update()
count()
save()
```

Esto evita que services, controllers o repositories dependan directamente de Mongoose.

---

# Repository

La capa **Repository** utiliza los DAO y expone operaciones orientadas al dominio de la aplicación.

Existen repositories para:

```text
users.repository.js
events.repository.js
tickets.repository.js
```

Algunos ejemplos de operaciones son:

```text
findByEmail()
createUser()
findEvents()
createEvent()
findActiveByUserAndEvent()
getActiveTicketsByEvent()
getMyTickets()
getTicketsByEvent()
saveTicket()
```

Los repositories no importan modelos de Mongoose directamente.

---

# Services

La capa de **Services** concentra la lógica de negocio.

Los services trabajan mediante repositories y nunca acceden directamente a los modelos de Mongoose ni a MongoDB.

Entre las reglas implementadas se encuentran:

- Validación de datos de registro.
- Normalización de emails.
- Hash de contraseñas.
- Validación de credenciales.
- Control de emails duplicados.
- Validación de fechas de eventos.
- Validación de capacidad y precio.
- Control de estados de eventos.
- Control de propiedad de eventos.
- Validación de inscripciones duplicadas.
- Cálculo de cupos ocupados y disponibles.
- Validación de permisos sobre tickets.
- Cancelación lógica de inscripciones.
- Generación de códigos de reserva.
- Envío de emails de confirmación.

Los controllers no calculan cupos ni implementan reglas de negocio.

---

# Controllers

Los controllers coordinan la comunicación HTTP.

Sus responsabilidades son:

- Obtener datos desde `req.body`, `req.params` y `req.query`.
- Invocar el service correspondiente.
- Transformar las respuestas mediante DTO.
- Establecer el código HTTP.
- Enviar la respuesta al cliente.
- Delegar errores al middleware centralizado mediante `next(error)`.

Los controllers no importan modelos de Mongoose ni realizan consultas directas a MongoDB.

---

# DTO

La aplicación utiliza **Data Transfer Objects (DTO)** para controlar qué información se devuelve al cliente.

Existen:

```text
user.dto.js
event.dto.js
ticket.dto.js
```

## UserDTO

Controla la información pública de los usuarios.

Expone:

```text
id
first_name
last_name
email
role
```

Nunca expone:

```text
password
```

La contraseña tampoco se incluye dentro del payload del JWT.

## EventDTO

Controla la representación de los eventos.

Expone información como:

```text
id
title
description
category
date
location
capacity
price
status
organizer
createdAt
updatedAt
```

Cuando `organizer` se encuentra populado, solamente se exponen los campos permitidos.

## TicketDTO

Controla las respuestas relacionadas con tickets e inscripciones.

Expone información como:

```text
id
status
quantity
reservationCode
cancelledAt
createdAt
updatedAt
event
user
```

Cuando `event` o `user` se encuentran populados, el DTO filtra los campos permitidos.

La contraseña de un usuario nunca se expone.

---

# Autenticación

La autenticación utiliza Passport.js.

Las estrategias se encuentran centralizadas en:

```text
src/config/passport.config.js
```

Se utilizan tres estrategias:

- `register`
- `login`
- `current`

Passport delega las reglas de negocio a la capa de services.

---

# Registro

```http
POST /api/sessions/register
```

Ejemplo:

```json
{
  "first_name": "Lucia",
  "last_name": "Fernandez",
  "email": "lucia.fernandez@mail.com",
  "password": "123456"
}
```

Reglas principales:

- Todos los campos son obligatorios.
- El email se normaliza mediante `trim()` y `toLowerCase()`.
- Se valida el formato del email.
- La contraseña debe cumplir la longitud mínima.
- No pueden existir dos usuarios con el mismo email.
- La contraseña se almacena hasheada mediante bcrypt.
- El registro público siempre asigna el rol `user`.
- El campo `role` enviado desde el body es ignorado.

Una creación exitosa devuelve:

```text
201 Created
```

Ejemplo:

```json
{
  "status": "success",
  "payload": {
    "id": "user_id",
    "first_name": "Lucia",
    "last_name": "Fernandez",
    "email": "lucia.fernandez@mail.com",
    "role": "user"
  }
}
```

La respuesta utiliza `UserDTO` y nunca contiene la contraseña.

---

# Login

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

Si las credenciales son correctas, se genera un JWT y se almacena en una cookie llamada:

```text
currentUser
```

La cookie utiliza:

```text
httpOnly: true
sameSite: lax
secure: true en producción
```

El JWT contiene solamente:

```text
id
email
role
```

Nunca contiene `password`.

Una autenticación correcta devuelve:

```text
200 OK
```

Las credenciales incorrectas devuelven:

```text
401 Unauthorized
```

con un mensaje genérico.

---

# Usuario autenticado

```http
GET /api/sessions/current
```

Requiere autenticación.

Ejemplo:

```json
{
  "status": "success",
  "payload": {
    "id": "user_id",
    "first_name": "Lucia",
    "last_name": "Fernandez",
    "email": "lucia.fernandez@mail.com",
    "role": "user"
  }
}
```

La respuesta pasa por `UserDTO`.

El campo `password` nunca es enviado al cliente.

---

# Logout

```http
POST /api/sessions/logout
```

Elimina la cookie:

```text
currentUser
```

Después del logout, intentar acceder nuevamente a:

```http
GET /api/sessions/current
```

devuelve:

```text
401 Unauthorized
```

---

# Roles y autorización

La aplicación posee tres roles:

- `user`
- `organizer`
- `admin`

## Matriz de permisos

| Acción | user | organizer | admin |
| --- | :---: | :---: | :---: |
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar eventos ajenos | ❌ | ❌ | ✅ |
| Cambiar estado de eventos propios | ❌ | ✅ | ✅ |
| Inscribirse a eventos | ✅ | ✅ | ✅ |
| Consultar tickets propios | ✅ | ✅ | ✅ |
| Cancelar ticket propio | ✅ | ✅ | ✅ |
| Consultar inscripciones de evento propio | ❌ | ✅ | ✅ |
| Consultar inscripciones de evento ajeno | ❌ | ❌ | ✅ |
| Cancelar tickets de otros usuarios | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

Las rutas protegidas utilizan:

```text
authenticate
authorize(...roles)
```

La propiedad específica de eventos y tickets se valida dentro de los services.

Un usuario no autenticado recibe:

```text
401 Unauthorized
```

Un usuario autenticado sin el rol necesario recibe:

```text
403 Forbidden
```

---

# Eventos

El modelo `Event` contiene:

```text
title
description
category
date
location
capacity
price
status
organizer
createdAt
updatedAt
```

Los estados permitidos son:

```text
draft
published
cancelled
finished
```

---

## Listar eventos

```http
GET /api/events
```

Acceso público.

Permite filtros, paginación y ordenamiento.

Parámetros disponibles:

| Parámetro | Descripción |
| --- | --- |
| `status` | Estado del evento |
| `category` | Categoría |
| `location` | Ubicación |
| `dateFrom` | Fecha mínima |
| `dateTo` | Fecha máxima |
| `page` | Página |
| `limit` | Cantidad de resultados por página |
| `sort` | Campo de ordenamiento |

Ejemplo:

```http
GET /api/events?status=published&page=2&limit=5
```

Ejemplo de respuesta:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 3,
  "totalPages": 1
}
```

También se pueden combinar filtros:

```http
GET /api/events?status=published&category=Tecnología&location=Río Grande&page=1&limit=5&sort=date
```

Para ordenar de manera descendente se utiliza `-`:

```text
sort=-date
```

Campos admitidos para ordenar:

```text
date
title
capacity
price
createdAt
```

---

# Consultar evento por ID

```http
GET /api/events/:id
```

Acceso público.

Si el evento no existe:

```text
404 Not Found
```

---

# Crear evento

```http
POST /api/events
```

Acceso:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Festival Tecnológico Río Grande",
  "description": "Encuentro de tecnología y desarrollo de software",
  "category": "Tecnología",
  "date": "2026-12-20T19:00:00.000Z",
  "location": "Río Grande, Tierra del Fuego",
  "capacity": 50,
  "price": 5000,
  "status": "published"
}
```

Reglas:

- La fecha debe ser futura.
- `capacity` debe ser mayor a `0`.
- `price` debe ser mayor o igual a `0`.
- El organizer se obtiene del usuario autenticado.
- El organizer enviado en el body es ignorado.
- Un evento nuevo no puede crearse como `cancelled`.
- Un evento nuevo no puede crearse como `finished`.

Una creación exitosa devuelve:

```text
201 Created
```

Un usuario con rol `user` intentando crear un evento recibe:

```text
403 Forbidden
```

---

# Modificar evento

```http
PUT /api/events/:id
```

Acceso:

```text
organizer
admin
```

Reglas:

- Un organizer solamente puede modificar eventos propios.
- Un organizer intentando modificar un evento ajeno recibe `403 Forbidden`.
- Un admin puede modificar cualquier evento.
- Un evento cancelado no puede modificarse.
- El organizer no puede modificarse desde el body.
- El estado no puede modificarse mediante este endpoint.
- La nueva fecha debe continuar siendo futura.
- La capacidad debe ser mayor a `0`.
- El precio debe ser mayor o igual a `0`.

---

# Cambiar estado de evento

```http
PATCH /api/events/:id/status
```

Ejemplo:

```json
{
  "status": "cancelled"
}
```

Estados disponibles:

```text
draft
published
cancelled
finished
```

Reglas:

- Un organizer solamente puede modificar eventos propios.
- Un admin puede modificar cualquier evento.
- Un evento cancelado no puede volver a cambiar de estado.
- No puede publicarse un evento cuya fecha ya haya pasado.

---

# Tickets e inscripciones

Los tickets representan la inscripción de un usuario a un evento.

El modelo contiene:

```text
user
event
status
quantity
reservationCode
createdAt
cancelledAt
```

Las referencias `user` y `event` utilizan `ObjectId` de Mongoose.

Los estados utilizados son:

```text
active
cancelled
```

Un ticket `active` ocupa cupo.

Un ticket `cancelled` no ocupa cupo.

---

# Inscribirse a un evento

```http
POST /api/events/:eid/tickets
```

Requiere autenticación.

Ejemplo:

```json
{
  "quantity": 1
}
```

El service valida:

- Que el evento exista.
- Que el evento esté `published`.
- Que la fecha del evento todavía no haya pasado.
- Que `quantity` sea un número entero mayor a `0`.
- Que el usuario no tenga otra inscripción activa al mismo evento.
- Que existan cupos suficientes.

Los cupos ocupados se calculan sumando `quantity` de todos los tickets activos.

Los tickets cancelados no son tenidos en cuenta para calcular los cupos ocupados.

Si la inscripción es válida:

- Se genera un `reservationCode`.
- Se crea el ticket con estado `active`.
- Se envía un email de confirmación mediante Nodemailer.

Una inscripción exitosa devuelve:

```text
201 Created
```

Ejemplo:

```json
{
  "status": "success",
  "message": "Inscripción realizada correctamente",
  "payload": {
    "id": "ticket_id",
    "status": "active",
    "quantity": 1,
    "reservationCode": "codigo-de-reserva",
    "cancelledAt": null,
    "event": "event_id",
    "user": "user_id"
  }
}
```

---

# Inscripción duplicada

Un usuario no puede tener dos tickets activos para el mismo evento.

Si intenta inscribirse nuevamente:

```text
409 Conflict
```

Ejemplo:

```json
{
  "status": "error",
  "message": "Ya tenés una inscripción activa para este evento"
}
```

---

# Evento sin cupo

Si la cantidad solicitada supera los cupos disponibles:

```text
409 Conflict
```

Ejemplo:

```json
{
  "status": "error",
  "message": "No hay cupos suficientes. Cupos disponibles: 0"
}
```

---

# Consultar mis tickets

```http
GET /api/tickets/my-tickets
```

Requiere autenticación.

Devuelve solamente las inscripciones pertenecientes al usuario autenticado.

Los datos básicos del evento relacionado se obtienen mediante `populate`:

```text
title
date
location
```

La respuesta es transformada mediante `TicketDTO`.

---

# Consultar tickets de un evento

```http
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer
admin
```

Reglas:

- Un organizer solamente puede consultar las inscripciones de eventos propios.
- Un admin puede consultar las inscripciones de cualquier evento.
- Un organizer intentando consultar un evento ajeno recibe `403 Forbidden`.

Los datos básicos del usuario se obtienen mediante `populate`:

```text
first_name
last_name
email
```

El `password` nunca se incluye.

---

# Cancelar ticket

```http
PATCH /api/tickets/:tid/cancel
```

Requiere autenticación.

Puede cancelar el ticket:

- El usuario propietario.
- Un administrador.

La cancelación no elimina físicamente el documento.

Se actualizan:

```text
status: cancelled
cancelledAt: fecha de cancelación
```

Ejemplo:

```json
{
  "status": "success",
  "message": "Ticket cancelado correctamente",
  "payload": {
    "id": "ticket_id",
    "status": "cancelled",
    "quantity": 1,
    "reservationCode": "codigo",
    "cancelledAt": "2026-09-03T21:35:00.130Z"
  }
}
```

Un ticket cancelado deja de ocupar cupo.

Esto permite que otro usuario pueda inscribirse si se libera disponibilidad.

Un ticket ya cancelado no puede cancelarse nuevamente.

---

# Notificaciones por email

La aplicación utiliza **Nodemailer** para enviar un correo electrónico cuando una inscripción se confirma correctamente.

El envío se realiza desde la capa:

```text
src/services/mail.service.js
```

Las credenciales SMTP nunca se encuentran hardcodeadas.

Se obtienen desde:

```text
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
MAIL_FROM
```

El email informa al usuario sobre la confirmación de su inscripción y los datos principales del evento.

---

# Usuarios

## Listar usuarios

```http
GET /api/users
```

Acceso exclusivo:

```text
admin
```

La respuesta utiliza `UserDTO`.

Las contraseñas y hashes nunca son enviados al cliente.

---

# Manejo de errores

La API utiliza un middleware global:

```text
src/middlewares/errorHandler.js
```

Los controllers delegan los errores mediante:

```js
next(error);
```

El middleware devuelve un formato consistente:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

Los principales códigos utilizados son:

| Código | Significado |
| --- | --- |
| `400` | Datos inválidos o regla de negocio incumplida |
| `401` | Usuario no autenticado |
| `403` | Usuario autenticado sin permisos |
| `404` | Recurso no encontrado |
| `409` | Conflicto de estado o recurso |
| `500` | Error interno del servidor |

Ejemplos de `409`:

- Email ya registrado.
- Inscripción activa duplicada.
- Evento sin cupos suficientes.

Los errores internos devuelven:

```text
Error interno del servidor
```

sin exponer información técnica sensible.

---

# Seguridad

La aplicación implementa:

- Contraseñas hasheadas mediante bcrypt.
- Normalización de emails.
- Validación de emails duplicados.
- Registro público sin posibilidad de elegir rol.
- JWT firmado mediante una clave almacenada en variables de entorno.
- JWT sin password dentro del payload.
- JWT almacenado en cookie HTTP Only.
- Autenticación mediante Passport.js.
- Autorización basada en roles.
- Validación de propiedad de recursos.
- Separación entre autenticación `401` y autorización `403`.
- DTO para controlar información enviada al cliente.
- Password excluido de todas las respuestas.
- Datos populados filtrados mediante DTO.
- Controllers sin acceso directo a Mongoose.
- Services sin acceso directo a Mongoose.
- Repositories sin acceso directo a modelos.
- Modelos de Mongoose importados únicamente en DAO.
- Credenciales de correo mediante variables de entorno.
- `.env` excluido del repositorio.
- `node_modules` excluido del repositorio.

---

# Endpoints

## Sesiones

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | `/api/sessions/register` | Registrar usuario | Público |
| POST | `/api/sessions/login` | Iniciar sesión | Público |
| GET | `/api/sessions/current` | Obtener usuario actual | Autenticado |
| POST | `/api/sessions/logout` | Cerrar sesión | Público |

## Eventos

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/events` | Listar eventos | Público |
| GET | `/api/events/:id` | Consultar evento | Público |
| POST | `/api/events` | Crear evento | Organizer / Admin |
| PUT | `/api/events/:id` | Modificar evento | Dueño / Admin |
| PATCH | `/api/events/:id/status` | Cambiar estado | Dueño / Admin |
| POST | `/api/events/:eid/tickets` | Inscribirse | Autenticado |
| GET | `/api/events/:eid/tickets` | Ver inscripciones del evento | Dueño / Admin |

## Tickets

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/tickets/my-tickets` | Consultar tickets propios | Autenticado |
| PATCH | `/api/tickets/:tid/cancel` | Cancelar ticket | Dueño / Admin |

## Usuarios

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/users` | Listar usuarios | Admin |

---

# Creación de usuarios de prueba

El registro público crea siempre usuarios con rol:

```text
user
```

Ejemplo:

```http
POST /api/sessions/register
```

```json
{
  "first_name": "Usuario",
  "last_name": "Prueba",
  "email": "usuario@test.com",
  "password": "123456"
}
```

Para probar funcionalidades de `organizer` y `admin`, se puede registrar primero el usuario y posteriormente modificar su campo `role` desde MongoDB Atlas o MongoDB Compass.

Roles disponibles:

```text
user
organizer
admin
```

El endpoint público de registro nunca permite establecer el rol desde el body.

---

# Flujo de autenticación

```text
POST /api/sessions/register
        ↓
Usuario creado con role=user
        ↓
POST /api/sessions/login
        ↓
Passport valida credenciales
        ↓
Se genera JWT
        ↓
JWT se almacena en cookie currentUser
        ↓
GET /api/sessions/current
        ↓
Passport valida JWT desde la cookie
        ↓
UserDTO devuelve datos seguros
        ↓
POST /api/sessions/logout
        ↓
Cookie currentUser eliminada
```

---

# Flujo de inscripción

```text
Usuario autenticado
        ↓
Selecciona evento published
        ↓
POST /api/events/:eid/tickets
        ↓
Validar evento
        ↓
Validar fecha
        ↓
Validar inscripción duplicada
        ↓
Calcular cupos ocupados
        ↓
Validar disponibilidad
        ↓
Generar reservationCode
        ↓
Crear ticket active
        ↓
Enviar email de confirmación
        ↓
Inscripción confirmada
```

Si posteriormente se cancela:

```text
PATCH /api/tickets/:tid/cancel
        ↓
status = cancelled
        ↓
cancelledAt = fecha actual
        ↓
Ticket deja de ocupar cupo
        ↓
El cupo puede utilizarse nuevamente
```

---

# Pruebas finales realizadas

Antes de la entrega se verificó el flujo completo solicitado.

## 1. Registro → login → current → logout → current 401

Resultado:

```text
✅Registro: 201 Created
✅Login: 200 OK
✅Current: 200 OK
✅Logout: 200 OK
✅Current después de logout: 401 Unauthorized
```

---

## 2. User intenta crear evento

Resultado:

```text
✅403 Forbidden
```

El middleware de autorización impide que un usuario con rol `user` cree eventos.

---

## 3. Organizer crea evento → user se inscribe → email

Resultado:

```text
✅Organizer crea evento: 201 Created
✅Evento published
✅User crea inscripción: 201 Created
✅Ticket active
✅ReservationCode generado
✅Email de confirmación recibido
✅Cupo contabilizado correctamente
```

---

## 4. Inscripción duplicada

El mismo usuario intenta inscribirse nuevamente al mismo evento.

Resultado:

```text
✅409 Conflict
```

Mensaje:

```text
Ya tenés una inscripción activa para este evento
```

---

## 5. Evento sin cupo

Se ocuparon todos los cupos del evento y un nuevo usuario intentó inscribirse.

Resultado:

```text
✅409 Conflict
```

Mensaje:

```text
No hay cupos suficientes. Cupos disponibles: 0
```

---

## 6. Cancelación libera cupo

Se canceló un ticket activo.

Resultado:

```text
✅Ticket cambia a cancelled
✅cancelledAt registrado
✅El documento no se elimina
✅El ticket deja de ocupar cupo
✅Otro usuario puede inscribirse nuevamente
✅Nueva inscripción: 201 Created
```

---

## 7. Organizer modifica evento ajeno

Resultado:

```text
✅403 Forbidden
```

La validación de ownership se realiza en el service.

---

## 8. Admin modifica evento ajeno

Resultado:

```text
✅200 OK
```

El administrador puede modificar eventos independientemente de su organizer.

---

## 9. Respuestas sin password

Se verificaron:

```text
✅Register
✅Current
✅UserDTO
✅EventDTO
✅TicketDTO
✅Populate de User
✅Populate de Organizer
✅JWT
```

Ninguna respuesta ni payload JWT contiene `password`.

---

## 10. Listado paginado

Request:

```http
GET /api/events?status=published&page=2&limit=5
```

Respuesta obtenida:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 3,
  "totalPages": 1
}
```

La página 2 devuelve un arreglo vacío porque la cantidad total de eventos publicados es menor al límite necesario para generar una segunda página.

La estructura paginada funciona correctamente.

---

# Checklist de la entrega final

## Autenticación y usuarios

```text
✅User con first_name, last_name, email, password y role
✅Password hasheado con bcrypt
✅Register
✅Login
✅Current
✅Logout
✅JWT
✅Cookie HTTP Only
✅Passport register
✅Passport login
✅Passport current
✅Password nunca expuesto
```

## Roles

```text
✅user
✅organizer
✅admin
✅user por defecto
✅role ignorado en registro público
✅authenticate
✅authorize
✅401
✅403
```

## Eventos

```text
✅Modelo Event completo
✅POST
✅GET
✅GET /:id
✅PUT /:id
✅PATCH /:id/status
✅Ownership
✅Admin override
✅Fecha futura
✅capacity > 0
✅price >= 0
✅Eventos cancelados no modificables
✅Filtros
✅Paginación
✅Ordenamiento
```

## Tickets

```text
✅Referencia a User
✅Referencia a Event
✅Status
✅Quantity
✅ReservationCode
✅CreatedAt
✅CancelledAt
✅Evento published
✅Control de cupos
✅Duplicados activos
✅Cancelled no ocupa cupo
✅My Tickets
✅Populate
✅Tickets por evento
✅Cancelación lógica
✅Dueño/Admin
```

## Notificaciones

```text
✅Nodemailer
✅Email de confirmación
✅Credenciales mediante variables de entorno
```

## Arquitectura

```text
✅routes
✅controllers
✅services
✅repositories
✅dao
✅dto
✅models
✅middlewares
✅utils
✅config
✅Modelos importados únicamente en DAO
✅Services utilizan repositories
✅Controllers coordinan request/response
✅DTO para User, Event y Ticket
✅Middleware centralizado de errores
```

## Variables de entorno

```text
✅PORT
✅MONGO_URL
✅JWT_SECRET
✅JWT_EXPIRES_IN
✅NODE_ENV
✅MAIL_HOST
✅MAIL_PORT
✅MAIL_USER
✅MAIL_PASS
✅MAIL_FROM
```

---

# Autor

**Esteban Oyarzun Romano**

Proyecto desarrollado para **Backend II**.