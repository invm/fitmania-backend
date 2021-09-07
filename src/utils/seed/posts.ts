import Post, { IPost } from '../../models/Post';
import User from '../../models/User';
import EventsDBService from '../../services/Events';
import PostsDBService from '../../services/Posts';
import { createUserFolder, download } from './init';
import faker from 'faker';
import chalk from 'chalk';

const getPostImage = async (userId: string, sport: string): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		let filename = '';
		let ext = '.jpeg';
		filename = `${userId}/${userId}${Date.now()}${ext}`;

		await createUserFolder(userId);

		let randomWaitPeriod = Math.random() * 1000;

		setTimeout(() => {
			download(`https://source.unsplash.com/800x450/?${sport}`, `./src/media/${filename}`, () => {
				resolve(`${filename}`);
			});
		}, randomWaitPeriod);
	});
};

const createPost = async (
	userId: string,
	sport: 'Running' | 'Biking' | 'Soccer' | 'Basketball' | 'Rugby' | 'Hiking' | 'Tennis'
) => {
	let imageBool = Math.floor(Math.random() * 2);
	let image = imageBool ? await getPostImage(userId, sport) : '';
	let eventBool = Math.floor(Math.random() * 2);
	let user = await User.findOne({ _id: userId });

	let post: IPost = {
		author: userId,
		...(image && { image }),
		text: faker.lorem.lines(2)
	};

	if (eventBool) {
		let limit = Math.floor(Math.random() * 7) + 2;
		let eventType = sport;
		let eventDoc = await EventsDBService.createEvent({
			eventType,
			participants: [userId],
			openEvent: true,
			rejectedParticipants: [],
			pendingApprovalParticipants: [],
			limitParticipants: limit,
			startDate: new Date(new Date().valueOf() + 36e5 * Math.floor(Math.random() * 48)),
			pace: 'Medium',
			address: user.location,
			coordinates: {
				type: 'Point',
				coordinates: [34.7758191, 32.0687123] // just random stuff, no any logic at this point
			}
		});
		await PostsDBService.createPost({
			...post,
			eventType,
			event: eventDoc._id
		});
	} else {
		await PostsDBService.createPost(post);
	}

	console.log(
		chalk.greenBright(`[CREATED POST BY ${user.name} ${user?.lastname}] ${eventBool ? 'WITH' : 'WITHOUT'} EVENT`)
	);
};

export const populatePosts = async (number: number) => {
	let users = await User.find({}).lean();
	let usedUsers = [] as string[];
	let postsPromises = Array(number)
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
						await createPost(user._id, sport as any);
					}
					resolve('');
				})
		);

	await Promise.all(postsPromises);
	console.log(chalk.greenBright(`[CREATED ${postsPromises.length} POST${postsPromises.length > 1 ? 'S' :''}]`));
};
