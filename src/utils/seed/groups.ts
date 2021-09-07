import User from '../../models/User';
import Post from '../../models/Post';
import GroupDBService from '../../services/Groups';
import faker from 'faker';
import chalk from 'chalk';

export const createGroup = async (userId: string, title: string, sport: string, description: string) => {
	await GroupDBService.createGroup({
		title,
		sport,
		description,
		users: [userId],
		admin: userId
	});
};

export const populateGroups = async (number: number) => {
	let users = await User.find({}).lean();
	let usedUsers = [] as string[];
	let groupsPromises = Array(number)
		.fill('')
		.map(
			(_) =>
				new Promise(async (resolve, reject) => {
					let user = users[Math.floor(Math.random() * users.length)];
					while (usedUsers.includes(user._id)) {
						user = users[Math.floor(Math.random() * users.length)];
					}
					usedUsers.push(user._id);
					let sport = user.preferable[Math.floor(Math.random() * user.preferable.length)];

					if (sport) {
						await createGroup(user._id, faker.random.words(2), sport, faker.lorem.lines(1));
					}

					resolve('');
				})
		);

	await Promise.all(groupsPromises);
	console.log(
		chalk.greenBright(`[CREATED ${groupsPromises.length} GROUP${groupsPromises.length > 1 ? 'S' : ''}]`)
	);
};
