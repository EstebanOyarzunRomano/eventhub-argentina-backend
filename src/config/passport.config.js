import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as CustomStrategy } from "passport-custom";
import { Strategy as JwtStrategy } from "passport-jwt";

import usersRepository from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Extrae el JWT desde la cookie currentUser
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }

  return null;
};

const initializePassport = () => {
  /*
   * REGISTER
   * Valida datos, normaliza email, verifica duplicados,
   * hashea contraseña y crea el usuario.
   */
  passport.use(
    "register",
    new CustomStrategy(async (req, done) => {
      try {
        const { first_name, last_name, email, password } = req.body;

        // 1. Validar campos obligatorios
        if (!first_name || !last_name || !email || !password) {
          const error = new Error("Faltan campos obligatorios");
          error.statusCode = 400;
          return done(error);
        }

        // 2. Normalizar email
        const normalizedEmail = email.trim().toLowerCase();

        // 3. Validar formato
        if (!EMAIL_REGEX.test(normalizedEmail)) {
          const error = new Error("El email tiene un formato inválido");
          error.statusCode = 400;
          return done(error);
        }

        // 4. Validar longitud de contraseña
        if (password.length < MIN_PASSWORD_LENGTH) {
          const error = new Error(
            `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
          );

          error.statusCode = 400;
          return done(error);
        }

        // 5. Verificar email duplicado
        const existingUser =
          await usersRepository.findByEmail(normalizedEmail);

        if (existingUser) {
          const error = new Error("El email ya está registrado");
          error.statusCode = 409;
          return done(error);
        }

        // 6. Hashear contraseña
        const hashedPassword = await createHash(password);

        // 7. Crear usuario
        // No enviamos role para impedir que sea manipulado desde el body
        const newUser = await usersRepository.createUser({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });

        // 8. Usuario seguro, sin password
        const safeUser = {
          id: newUser._id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          role: newUser.role,
        };

        return done(null, safeUser);
      } catch (error) {
        return done(error);
      }
    })
  );

  /*
   * LOGIN
   * Valida email y contraseña.
   * NO genera el JWT.
   */
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, done) => {
        try {
          const normalizedEmail = email.trim().toLowerCase();

          const user =
            await usersRepository.findByEmail(normalizedEmail);

          if (!user) {
            const error = new Error("Credenciales inválidas");
            error.statusCode = 401;
            return done(error);
          }

          const validPassword = await isValidPassword(
            password,
            user.password
          );

          if (!validPassword) {
            const error = new Error("Credenciales inválidas");
            error.statusCode = 401;
            return done(error);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /*
   * CURRENT
   * Lee y valida el JWT desde la cookie currentUser.
   */
  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user = {
            id: jwtPayload.id,
            email: jwtPayload.email,
            role: jwtPayload.role,
          };

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /*
   * Futuras estrategias:
   *
   * passport.use("google", ...)
   * passport.use("github", ...)
   *
   * Se agregan acá sin modificar app.js.
   */
};

export default initializePassport;