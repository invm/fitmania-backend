require('dotenv').config();
require('./types/Request');
import express, { Application, NextFunction, Request, Response } from 'express';
import { Respond } from './utils/Responder';
import session from 'express-session';
const helmet = require('helmet');
import cors from 'cors';
import passport from 'passport';
const MongoStore = require('connect-mongo')(session);
import assert from 'assert';
import nconf from 'nconf';
nconf.file({ file: __dirname + '/config/appconf.json' });
import path from 'path';
import mongoose from './config/db';
import chalk from 'chalk';
import morgan from 'morgan';
require('./types/Request');
assert.ok(process.env.NODE_ENV, 'Error starting up server, environment definitions are missing.');

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [...process.env.ALLOWED_ORIGIN.split(',')],
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  })
);
app.use(helmet());

const morganChalk = morgan(function (tokens: any, req: any, res: any) {
  console.log(chalk.yellowBright('body:'), req.body);
  return [
    chalk.white(`[ ${new Date().toLocaleString('he-il')} ]`),
    res.statusCode < 400
      ? chalk.green.bold(tokens.status(req, res))
      : chalk.red.bold(tokens.status(req, res)),
    chalk.yellowBright(tokens.method(req, res)),
    chalk.white(tokens.url(req, res)),
    chalk.yellowBright(tokens['response-time'](req, res) + ' ms'),
    chalk.whiteBright('\n---------------------------------'),
  ].join(' ');
});
// Logger initialization
app.use(morganChalk);

app.use((req: Request, res: Response, next: NextFunction) => {
  // req.startTime = new Date().getTime();
  console.log('----------------------');
  console.log(
    `New Request ${
      req._user
        ? `by ${req._user?.name ? `${req._user?.name} ${req._user?.lastname} ` : ''}(${
            req._user._id
          })`
        : ''
    }, Target: ${req.method} - ${req.url}`
  );
  next();
});

// Authentication session setup
app.use(
  session({
    name: 'sid',
    cookie: {
      sameSite: 'strict',
      maxAge: nconf.get('auth:sessionTimer'),
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: process.env.NODE_ENV !== 'development',
    },
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      autoRemove: 'native', // Default
    }),
  })
);

if (process.env.NODE_ENV !== 'development') {
  app.set('trust proxy', 1);
}

// Passport config
app.use(passport.initialize({ userProperty: 'user' }));
app.use(passport.session({ pauseStream: false }));
require('./config/passport');

app.use(function (req: any, res: any, next: any) {
  res.locals.isAuthenticated = req.isAuthenticated();
  // Is used to tell if the user is authenticated or not
  next();
});

// Mount routes
app.use('/api/', require('./routes/index'));
app.use('/media', express.static(path.join(__dirname, 'media')));

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.use(function (req, res) {
  return Respond(req, res, false, { status: 404, msg: 'Not found' });
});

console.log('--------------------------------\n');
app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
  console.log('--------------------------------\n');
});
