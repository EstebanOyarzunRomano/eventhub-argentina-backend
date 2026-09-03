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
MONGO_URL=tu_url_de_conexion_a_mongodb
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
NODE_ENV=development

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

# Arquitectura

La aplicación utiliza una arquitectura organizada en capas para separar responsabilidades y reducir el acoplamiento entre la lógica de negocio y la persistencia.

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

Las respuestas que contienen información de las entidades principales son transformadas mediante DTO antes de ser enviadas al cliente.

---

## DAO

La capa **DAO (Data Access Object)** concentra el acceso directo a MongoDB mediante los modelos de Mongoose.

Existen DAO para las entidades principales:

```text
users.dao.js
events.dao.js
tickets.dao.js
```

Los DAO son los únicos componentes de la arquitectura que importan directamente los modelos de Mongoose.

Exponen operaciones genéricas de persistencia, por ejemplo:

```text
findById()
findOne()
find()
create()
update()
count()
```

Esto evita que services, controllers o repositories dependan directamente de Mongoose.

---

## Repository

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
findPublishedEvents()
createEvent()
findActiveByUserAndEvent()
countActiveTickets()
getMyTickets()
getTicketsByEvent()
cancelTicket()
```

Los repositories no importan modelos de Mongoose directamente.

---

## Services

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
- Cancelación de inscripciones.
- Generación de códigos de reserva.
- Envío de emails de confirmación.

Los controllers no calculan cupos ni implementan reglas de negocio.

---

## Controllers

Los controllers coordinan la comunicación HTTP.

Sus responsabilidades son:

- Obtener datos desde `req.body`, `req.params` y `req.query`.
- Invocar el service correspondiente.
- Transformar las respuestas mediante DTO cuando corresponde.
- Establecer el código HTTP.
- Enviar la respuesta al cliente.
- Delegar errores al middleware centralizado.

Los controllers no importan modelos de Mongoose ni realizan consultas directas a MongoDB.

---

## DTO

La aplicación utiliza **Data Transfer Objects (DTO)** para controlar qué información se devuelve al cliente.

Existen:

```text
user.dto.js
event.dto.js
ticket.dto.js
```

### UserDTO

Controla la información pública de los usuarios.

Puede exponer:

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

ni siquiera cuando la contraseña se encuentra hasheada.

### EventDTO

Controla la representación de los eventos y los datos del organizer.

Cuando el organizer se encuentra populado, solamente se exponen los campos permitidos.

### TicketDTO

Controla las respuestas relacionadas con inscripciones y tickets.

Cuando un ticket contiene documentos relacionados mediante `populate`, el DTO filtra también esos datos.

Por ejemplo, un usuario populado puede exponer:

```text
id
first_name
last_name
email
```

pero nunca su contraseña.

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

Passport delega las reglas de registro y login a la capa de services.

---

## Registro

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
- El email se normaliza.
- Se valida el formato del email.
- La contraseña debe cumplir la longitud mínima.
- No pueden existir dos usuarios con el mismo email.
- La contraseña se almacena hasheada mediante bcrypt.
- El registro público siempre asigna el rol `user`.
- El rol no puede manipularse desde el body.

Una creación exitosa devuelve:

```text
201 Created
```

La respuesta utiliza `UserDTO` y nunca contiene la contraseña.

---

## Login

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

Si las credenciales son correctas, se genera un JWT y se almacena en:

```text
currentUser
```

La cookie utiliza:

```text
httpOnly: true
sameSite: lax
```

Las credenciales incorrectas devuelven:

```text
401 Unauthorized
```

con un mensaje genérico.

---

## Usuario autenticado

```http
GET /api/sessions/current
```

Requiere autenticación.

Ejemplo de respuesta:

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

## Logout

```http
POST /api/sessions/logout
```

Elimina la cookie:

```text
currentUser
```

---

# Roles y autorización

La aplicación posee tres roles:

- `user`
- `organizer`
- `admin`

### Matriz de permisos

| Acción | user | organizer | admin |
| --- | :---: | :---: | :---: |
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar eventos ajenos | ❌ | ❌ | ✅ |
| Inscribirse a eventos | ✅ | ✅ | ✅ |
| Consultar tickets propios | ✅ | ✅ | ✅ |
| Consultar inscripciones de un evento propio | ❌ | ✅ | ✅ |
| Consultar inscripciones de eventos ajenos | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

Las rutas protegidas utilizan:

```text
authenticate
authorize(...roles)
```

La propiedad específica de recursos se valida dentro de los services.

---

# Eventos

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
| `limit` | Cantidad por página |
| `sort` | Ordenamiento |

Ejemplo:

```http
GET /api/events?status=published&category=Tecnología&page=1&limit=5&sort=date
```

El orden descendente utiliza `-`:

```text
sort=-date
```

---

## Consultar evento por ID

```http
GET /api/events/:id
```

Acceso público.

Si el evento no existe:

```text
404 Not Found
```

---

## Crear evento

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
  "date": "2026-10-20T19:00:00.000Z",
  "location": "Río Grande, Tierra del Fuego",
  "capacity": 50,
  "price": 5000,
  "status": "published"
}
```

Reglas:

- La fecha debe ser futura.
- La capacidad debe ser mayor a `0`.
- El precio no puede ser negativo.
- El organizer se obtiene del usuario autenticado.
- El organizer enviado en el body es ignorado.
- Un evento nuevo no puede crearse como `cancelled` o `finished`.

Una creación exitosa devuelve:

```text
201 Created
```

---

## Modificar evento

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
- Un admin puede modificar cualquier evento.
- Un evento cancelado no puede modificarse.
- El organizer no puede modificarse desde el body.
- El estado se modifica mediante el endpoint específico.
- La nueva fecha debe continuar siendo futura.
- La capacidad debe ser mayor a `0`.
- El precio debe ser mayor o igual a `0`.

---

## Cambiar estado

```http
PATCH /api/events/:id/status
```

Estados disponibles:

```text
draft
published
cancelled
finished
```

Reglas:

- Un organizer solamente puede modificar sus eventos.
- Un admin puede modificar cualquier evento.
- Un evento cancelado no puede volver a cambiar de estado.
- No puede publicarse un evento cuya fecha ya haya pasado.

---

# Tickets e inscripciones

Los tickets representan la inscripción de un usuario a un evento.

Cada ticket almacena información como:

```text
user
event
status
quantity
reservationCode
cancelledAt
```

---

## Inscribirse a un evento

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
- Que el evento esté publicado.
- Que el evento no haya finalizado.
- Que `quantity` sea un entero mayor a `0`.
- Que el usuario no tenga otra inscripción activa al mismo evento.
- Que existan cupos suficientes.

Los cupos ocupados se calculan utilizando los tickets activos del evento.

Si la inscripción es válida:

- Se genera un `reservationCode`.
- Se crea el ticket con estado `confirmed`.
- Se intenta enviar un email de confirmación.

Una inscripción exitosa devuelve:

```text
201 Created
```

---

## Consultar mis tickets

```http
GET /api/tickets/my-tickets
```

Requiere autenticación.

Devuelve las inscripciones pertenecientes al usuario autenticado.

Los datos del evento relacionado se obtienen mediante `populate` y son filtrados mediante `TicketDTO`.

---

## Consultar tickets de un evento

```http
GET /api/events/:eid/tickets
```

Acceso:

```text
organizer
admin
```

Un organizer solamente puede consultar las inscripciones de eventos que le pertenecen.

Un admin puede consultar las inscripciones de cualquier evento.

Los datos del usuario relacionados mediante `populate` pasan por `TicketDTO`, evitando exponer información sensible.

---

## Cancelar ticket

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

Un ticket ya cancelado no puede cancelarse nuevamente.

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

La respuesta pasa por `UserDTO`.

Las contraseñas y sus hashes nunca son enviados al cliente.

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
| `409` | Conflicto, por ejemplo un registro duplicado |
| `500` | Error interno del servidor |

Los errores internos no exponen información sensible al cliente.

---

# Seguridad

La aplicación implementa las siguientes medidas:

- Contraseñas hasheadas mediante bcrypt.
- Normalización de emails.
- Validación de emails duplicados.
- JWT firmado mediante una clave almacenada en variables de entorno.
- JWT almacenado en una cookie HTTP Only.
- Autenticación mediante Passport.js.
- Autorización basada en roles.
- Validación de propiedad de recursos.
- Separación entre autenticación (`401`) y autorización (`403`).
- DTO para controlar la información enviada al cliente.
- Las respuestas nunca exponen contraseñas.
- Los datos populados también son filtrados mediante DTO.
- Los services no acceden directamente a Mongoose.
- Los controllers no acceden directamente a Mongoose.
- Los repositories no importan modelos.
- Solamente los DAO importan modelos de Mongoose.
- `.env` y `node_modules` se encuentran excluidos del repositorio.

---

# Variables de entorno

Las credenciales y configuraciones sensibles se almacenan mediante variables de entorno.

El proyecto incluye:

```text
.env.example
```

como referencia.

El archivo:

```text
.env
```

no debe subirse al repositorio.

Variables utilizadas:

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor |
| `MONGO_URL` | Conexión a MongoDB |
| `JWT_SECRET` | Clave para firmar JWT |
| `JWT_EXPIRES_IN` | Duración del JWT |
| `NODE_ENV` | Entorno de ejecución |
| `MAIL_USER` | Usuario utilizado para el envío de emails |
| `MAIL_PASS` | Contraseña o clave de aplicación del servicio de correo |
| `MAIL_FROM` | Dirección utilizada como remitente |

---

# Pruebas realizadas

Antes de la entrega se verificaron los siguientes casos:

1. Registro de usuario exitoso devuelve `201 Created`.
2. El registro público asigna automáticamente el rol `user`.
3. La respuesta del registro no expone `password`.
4. Login correcto devuelve `200 OK`.
5. El login genera la cookie `currentUser`.
6. `/api/sessions/current` devuelve el usuario autenticado.
7. `/current` no expone `password`.
8. Usuario sin sesión intentando acceder a una ruta protegida recibe `401 Unauthorized`.
9. Usuario autenticado sin permisos intentando crear un evento recibe `403 Forbidden`.
10. Admin puede crear un evento y obtiene `201 Created`.
11. Se puede crear una inscripción para un evento publicado.
12. La inscripción valida los cupos disponibles.
13. Una inscripción exitosa genera un código de reserva.
14. Se pueden consultar los tickets propios.
15. Los documentos relacionados mediante `populate` son filtrados por DTO.
16. Una respuesta de ticket nunca expone el password del usuario.
17. El propietario puede cancelar su ticket.
18. La cancelación actualiza el estado a `cancelled`.
19. La cancelación registra `cancelledAt`.
20. Los errores de negocio utilizan el código HTTP correspondiente.
21. Los DAO son los únicos archivos que importan modelos de Mongoose.
22. Los repositories utilizan DAO.
23. Los services utilizan repositories.
24. Los controllers coordinan request/response y delegan la lógica de negocio.
25. Las respuestas de usuario, evento y ticket utilizan DTO.

---

# Flujo completo verificado

Se verificó correctamente el siguiente flujo:

```text
Registro
   ↓
Login
   ↓
Creación de evento
   ↓
Publicación
   ↓
Inscripción
   ↓
Consulta de mis tickets
   ↓
Cancelación del ticket
```

La API mantiene el comportamiento externo de las rutas existentes después de la incorporación de las capas DAO, Repository y DTO.

---

# Autor

**Esteban Oyarzun Romano**

Proyecto desarrollado para **Backend II**.