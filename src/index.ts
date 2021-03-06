require('dotenv').config();
import express, { Application } from 'express';
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
assert.ok(
	process.env.NODE_ENV,
	'Error starting up server, environment definitions are missing.'
);

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGIN.split(','),
		methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
		credentials: true,
		allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, api-key',
	})
);
app.use(helmet());

app.use((req, res, next) => {
	req.startTime = new Date().getTime();
	next();
});

const morganChalk = morgan(function (tokens: any, req: any, res: any) {
	req.body &&
		Object.keys(req.body).length &&
		console.log(chalk.blueBright('body:'), req.body);
	return [
		chalk.magenta(`[ ${new Date().toLocaleString('he-il')} ]`),
		res.statusCode < 400
			? chalk.green.bold(tokens.status(req, res))
			: chalk.red.bold(tokens.status(req, res)),
		chalk.white.bold(tokens.method(req, res)),
		chalk.yellow(tokens.url(req, res)),
		chalk.white(tokens['response-time'](req, res) + ' ms'),
	].join(' ');
});
// Logger initialization
app.use(morganChalk);

app.use((req, res, next) => {
	if (
		req.url.includes('/media/') ||
		req.headers['api-key'] === process.env.API_KEY
	)
		next();
	else res.status(502).send();
});

// if (process.env.NODE_ENV !== 'development') {
app.set('trust proxy', 1);
// }
// Authentication session setup
app.use(
	session({
		name: 'sid-FitMania',
		cookie: {
			sameSite: 'none',
			path: '/',
			maxAge: nconf.get('auth:sessionTimer'),
			secure: true,
			httpOnly: true,
		},
		secret: process.env.APP_SECRET,
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			autoRemove: 'native', // Default
			stringify: false, // Prevents stringification of the session data
		}),
	})
);

// Passport config
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Mount routes
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/', require('./routes/index'));

app.use(function (req, res) {
	return Respond(req, res, false, { status: 404, msg: 'Not found' });
});

app.listen(process.env.PORT, () => {
	console.log(`Listening on ${process.env.PORT}`);
});
