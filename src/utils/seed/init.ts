require('dotenv').config();
import '../../config/db';
import nconf from 'nconf';
nconf.file({ file: __dirname + '/config/appconf.json' });
import fs from 'fs';
import path from 'path';
import request from 'request';

export const sports = [
  'Running',
  'Biking',
  'Soccer',
  'Basketball',
  'Rugby',
  'Hiking',
  'Tennis',
];

export const download = (url: string, path: string, callback: () => any) => {
	request.head(url, (err, res, body) => {
		request(url).pipe(fs.createWriteStream(path)).on('close', callback);
	});
};

export const createUserFolder = async (userId: string) => {
	return new Promise(async (resolve, reject) => {
		const userFolder = path.join(__dirname, '../', '../', 'media', `${userId}`);

		await fs.access(userFolder, fs.constants.F_OK | fs.constants.W_OK, async (err: any) => {
			if (err && err.code === 'ENOENT') {
				console.log('No directory for user uploads, making one.');
				await fs.mkdir(userFolder, { recursive: true }, (err: any) => {
					if (err) throw err;
				});
				resolve({});
			}
			resolve({});
		});
	});
};
