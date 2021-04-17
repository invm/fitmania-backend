require('dotenv').config();
import '../../config/db';
import nconf from 'nconf';
nconf.file({ file: __dirname + '/config/appconf.json' });

export const sports = [
  'Running',
  'Biking',
  'Soccer',
  'Basketball',
  'Rugby',
  'Hiking',
  'Tennis',
];
