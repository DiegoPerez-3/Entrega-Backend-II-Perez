import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { config } from './config/env.config.js';
import { initializePassport } from './config/passport.config.js';

import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import productsRouter from './routes/products.router.js';
import favoritesRouter from './routes/favorites.routers.js';
import viewsRouter from './routes/views.router.js';
import cartRouter from './routes/cart.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

initializePassport();
app.use(passport.initialize());

mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/sessions', sessionsRouter);
app.use('/api/auth', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/', viewsRouter);

app.listen(config.PORT, () => console.log('Server running on port: ' + config.PORT));
