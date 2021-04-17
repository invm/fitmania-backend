require('dotenv').config();
import express, { Application } from 'express';
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const assert = require('assert');
const nconf = require('nconf');
nconf.file({ file: __dirname + '/config/appconf.json' });
const path = require('path');
const mongoose = require('./config/db');
const chalk = require('chalk');
const morgan = require('morgan');
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
app.use(passport.initialize({}));
app.use(passport.session({}));
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
  res.status(404).json({ errors: [{ msg: 'Not found' }] });
});

console.log('--------------------------------\n');
app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
  console.log('--------------------------------\n');
});
