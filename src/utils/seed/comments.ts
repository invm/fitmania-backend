import User from '../../models/User';
import Post from '../../models/Post';
import CommentsDBService from '../../services/Comments';
import PostsDBService from '../../services/Posts';
import faker from 'faker';
import chalk from 'chalk';

export const createComment = async (userId: string, postId: string, text: string) => {
	let comment = await CommentsDBService.createComment({
		post: postId,
		user: userId,
		text: text
	});

	await PostsDBService.addComment(postId, comment._id);
};

export const populateComments = async (number: number) => {
	let users = await User.find({}).lean();
	let posts = await Post.find({}).lean();
	let usedUsers = [] as string[];
	let commentsPromises = Array(number)
		.fill('')
		.map(
			(_) =>
				new Promise(async (resolve, reject) => {
					let user = users[Math.floor(Math.random() * users.length)];
					while (usedUsers.includes(user._id)) {
						user = users[Math.floor(Math.random() * users.length)];
					}
					usedUsers.push(user._id);
					let post = posts[Math.floor(Math.random() * posts.length)];

					await createComment(user._id, post._id, faker.lorem.lines(1));

					resolve('');
				})
		);

	await Promise.all(commentsPromises);
	console.log(
		chalk.greenBright(`[CREATED ${commentsPromises.length} COMMENT${commentsPromises.length > 1 ? 'S' : ''}]`)
	);
};
