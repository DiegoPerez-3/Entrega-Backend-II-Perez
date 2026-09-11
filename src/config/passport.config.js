import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';
import { usersRepository } from '../repositories/users.repository.js';
import { authService } from '../services/auth.service.js';
import { config } from './env.config.js';

// Extractor personalizado para obtener el JWT desde la cookie 'token_coder'
const cookieExtractor = (req) => {
  return req && req.cookies ? req.cookies['token_coder'] : null;
};

export const initializePassport = () => {
  // Estrategia Local para Registro: valida datos obligatorios y delega el registro al AuthService
  passport.use(
    'register',
    new passportLocal.Strategy(
      {
        usernameField: 'email',
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;
          const email = username;

          if (!first_name || !last_name || !email || !age || !password) {
            return done(null, false, { message: 'Faltan datos obligatorios' });
          }

          // Delegamos la creación al AuthService que valida de forma única si el usuario ya existe y asocia el carrito
          const userObject = await authService.registerUser({
            first_name,
            last_name,
            email,
            age,
            password,
          });

          return done(null, userObject);
        } catch (error) {
          return done(null, false, { message: error.message || 'Error en el registro' });
        }
      }
    )
  );

  // Estrategia Local para Login
  passport.use(
    'login',
    new passportLocal.Strategy(
      {
        usernameField: 'email',
      },
      async (username, password, done) => {
        try {
          // Validamos credenciales delegando al AuthService
          const userObject = await authService.validateUserLogin(username, password);
          if (!userObject) {
            return done(null, false, { message: 'Usuario o contraseña incorrectos' });
          }

          return done(null, userObject);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Estrategia JWT para Current
  // Extrae el token de la cookie y recupera el usuario vigente directamente de la base de datos
  passport.use(
    'current',
    new passportJWT.Strategy(
      {
        secretOrKey: config.JWT_SECRET,
        jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([cookieExtractor]),
      },
      async (jwtPayload, done) => {
        try {
          const userId = jwtPayload.user?._id || jwtPayload.user?.id || jwtPayload._id || jwtPayload.id;
          if (!userId) {
            return done(null, false, { message: 'Token sin identificador de usuario válido' });
          }

          // Buscamos al usuario en la base de datos para garantizar datos actualizados
          const user = await usersRepository.getById(userId);
          if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }

          const userObj = user.toObject ? user.toObject() : { ...user };
          delete userObj.password;

          return done(null, userObj);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
