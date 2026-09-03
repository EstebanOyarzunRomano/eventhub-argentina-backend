import passport from "passport";

import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as CustomStrategy } from "passport-custom";
import { Strategy as JwtStrategy } from "passport-jwt";

import sessionsService from "../services/sessions.service.js";

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }

  return null;
};

const initializePassport = () => {
  // REGISTER
  passport.use(
    "register",
    new CustomStrategy(async (req, done) => {
      try {
        const user = await sessionsService.register(req.body);

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // LOGIN
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
          const user = await sessionsService.login(
            email,
            password
          );

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // CURRENT
  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user =
            await sessionsService.getCurrentUser(
              jwtPayload.id
            );

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;