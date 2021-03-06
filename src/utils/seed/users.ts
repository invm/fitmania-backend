/**
 * Script to generate mock data.
 * imports json from mock.json, writes the number of users specified in the package.json script.
 * after creating the users, it removes them from the mock.json file.
 */
import User, { IUserDoc } from '../../models/User';
import path from 'path';
import request from 'request';
import faker from 'faker';
import chalk from 'chalk';
const cities = require('./cities.json');
import { createUserFolder, download, sports } from './init';

const generateUser = async ({
	name,
	lastname,
	birthday,
	gender,
	email,
	location
}: {
	name: string;
	lastname: string;
	birthday: Date;
	gender: string;
	email: string;
	location: string;
}) => {
	// get image for specified gender
	let user: IUserDoc = new User({
		name,
		lastname,
		birthday: new Date(birthday),
		email,
		location
	});
	let image = await getImage(user._id, gender);

	user.image = image;

	let allSports = [...sports];

	let preferable = [] as string[];
	let undesirable = [] as string[];

	Array(5)
		.fill(0)
		.forEach((v, i) => {
			let index = Math.floor(Math.random() * allSports.length);

			let sport = allSports[index];

			if (sport) {
				if (i % 2) {
					preferable.push(sport);
					allSports.splice(index, 1);
				} else {
					undesirable.push(sport);
					allSports.splice(index, 1);
				}
			}
		});

	user.preferable = preferable;
	user.undesirable = undesirable;

	await user.save();
};

const getImage = async (userId: string, gender: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		let filename = '';
		request.get(`https://randomuser.me/api/?gender=${gender.toLowerCase()}`, async (err, res, body) => {
			let json = JSON.parse(body);
			let ext = path.extname(json.results?.[0]?.picture?.large) ?? '.jpg';
			filename = `${userId}/${userId}${ext}`;

			await createUserFolder(userId);

			json.results?.[0]?.picture?.large &&
				download(json.results?.[0]?.picture?.large, `./src/media/${filename}`, () => {
					resolve(`${filename}`);
				});
		});
	});
};

const checkIfExists = async ({ name, lastname }: { name: string; lastname: string }) => {
	let user = await User.findOne({ name, lastname });
	return user ? true : false;
};

export const populateUsers = async (number: number) => {
	let createdUsers = 0;
	while (createdUsers < number) {
		// get the next user, check if exists, in not create the user, increment and continue
		let genders = ['male','female'];
		let gender = Math.floor(Math.random() * 2);
		let name = faker.name.firstName(gender);
		let lastname = faker.name.firstName();
		let location = cities[Math.floor(Math.random() * cities.length)].name + ', Israel';

		let exist = await checkIfExists({ name, lastname });
		let user = {
			name,
			lastname,
			birthday: faker.date.between('01-01-1980', '01-01-2002'),
			gender: genders[gender],
			email: faker.internet.email(name, lastname),
			location
		};
		if (!exist) {
			await generateUser(user);
			createdUsers++;
		}
	}
	console.log(chalk.greenBright(`[CREATED ${createdUsers} USER${createdUsers > 1 ? 'S' : ''}]`));
};

const removeRedundant = async () => {
	let users = await User.deleteMany({
		$or: [{ preferable: null }, { undesirable: null }]
	});
};
