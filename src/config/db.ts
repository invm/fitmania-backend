const chalk = require('chalk');
const mongoose = require('mongoose');
const {
  MONGO_HOST,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASS,
  MONGO_DB,
} = process.env;
const mongoURI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const safeURI = `mongodb://${MONGO_USER}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
let connectionOptions = {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  poolSize: 10, // Maintain up to 10 socket connections
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
  console.log(
    `Mongoose connection failed with the following error message:\n\t ${err}`
  );
});

mongoose.Promise = global.Promise;
module.exports = mongoose;
