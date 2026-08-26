# EventHub Argentina - Backend II

API REST desarrollada con Node.js, Express, MongoDB y Mongoose para una plataforma de eventos e inscripciones.

Actualmente el proyecto incluye una arquitectura organizada en capas, persistencia en MongoDB, registro seguro de usuarios y autenticación centralizada con Passport.js mediante estrategias de registro, login y usuario actual.

La autenticación utiliza JSON Web Tokens (JWT) almacenados en una cookie HTTP Only.

## Tecnologías utilizadas

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* bcrypt
* JSON Web Token
* cookie-parser
* dotenv
* Passport.js
* passport-local
* passport-jwt
* passport-custom

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

El proyecto utiliza una arquitectura organizada por responsabilidades:

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

## Rutas

### Health check

```http
GET /api/health
```

Permite comprobar el estado básico de la API.

### Eventos

```http
GET /api/events
```

Endpoint base correspondiente al recurso de eventos.

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

El rol no debe enviarse desde el cliente.

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
  "message": "No autorizado"
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

## Autor

Esteban Oyarzun Romano

Proyecto desarrollado para Backend II.

