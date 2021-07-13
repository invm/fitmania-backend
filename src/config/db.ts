import chalk from 'chalk';
import mongoose, { ConnectionOptions } from 'mongoose';
const { MONGO_HOST, MONGO_PORT, MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_STR, MONGO_QUERY } =
  process.env;
const HOST = MONGO_HOST + MONGO_PORT;
const CREDENTIALS = process.env.NODE_ENV !== 'development' ? `${MONGO_USER}:${MONGO_PASS}@` : ''
const mongoURI = `${MONGO_STR}://${CREDENTIALS}${HOST}/${MONGO_DB}${MONGO_QUERY}`;
const safeURI = `${MONGO_STR}://${HOST}/${MONGO_DB}${MONGO_QUERY}`;

let connectionOptions: ConnectionOptions = {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  connectTimeoutMS: 30000,
};

console.log(`Attempting to connect to ${safeURI}`);

mongoose.connect(mongoURI, connectionOptions).catch((err: Error) => {
  console.log(err);
});

mongoose.connection.on('connected', () => {
  console.log(chalk.yellow(`Mongoose connected to ${safeURI} successfully.`));
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.log(`Mongoose connection failed with the following error message:\n\t ${err}`);
});

mongoose.Promise = global.Promise;
export default mongoose;
