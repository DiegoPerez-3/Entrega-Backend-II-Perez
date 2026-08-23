import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';
import userModel from '../models/user.model.js';
import cartModel from '../models/cart.model.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { config } from './env.config.js';

const cookieExtractor = (req) => {
  return req && req.cookies ? req.cookies['token_coder'] : null;
};

export const initializePassport = () => {
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

          const exists = await userModel.findOne({ email });
          if (exists) {
            return done(null, false, { message: 'El usuario ya existe' });
          }

          const user = await userModel.create({
            first_name,
            last_name,
            email,
            age: Number(age),
            password: createHash(password),
          });

          const cart = await cartModel.create({
            userId: user._id,
            products: [],
          });

          user.cart = cart._id;
          await user.save();

          const userObject = user.toObject();
          delete userObject.password;

          return done(null, userObject);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.use(
    'login',
    new passportLocal.Strategy(
      {
        usernameField: 'email',
      },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username }).select('+password');
          if (!user) {
            return done(null, false, { message: 'Usuario o contraseña incorrectos' });
          }

          if (!isValidPassword(password, user.password)) {
            return done(null, false, { message: 'Usuario o contraseña incorrectos' });
          }

          const userObject = user.toObject();
          delete userObject.password;

          return done(null, userObject);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.use(
    'current',
    new passportJWT.Strategy(
      {
        secretOrKey: config.JWT_SECRET,
        jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([cookieExtractor]),
      },
      async (jwtPayload, done) => {
        try {
          const user = jwtPayload.user || jwtPayload;
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
