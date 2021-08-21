import PostsDBService from './Posts';
import NotificationsDBService from './Notifications';
import Notifications from '../config/notifications';

export const newCommentNotification = async (
	postId: string,
	commentAuthorId: string
) => {
	let post = await PostsDBService.getPost({ _id: postId });

	if (commentAuthorId.toString() !== post.author.toString()) {
		let title = Notifications.newComment.title;
		let body = Notifications.newComment.body;

		await NotificationsDBService.createNotification({
			user: post.author,
			type: 'post',
			title,
			body,
			resource: postId,
		});
	}
};

export const eventNotificationToPostAuthor = async (
	postId: string,
	type: 'userJoined' | 'userLeft' | 'newJoinRequest'
) => {
	let post = await PostsDBService.getPost({ _id: postId });

	let title = Notifications[type].title;
	let body = Notifications[type].body;

	await NotificationsDBService.createNotification({
		user: post.author,
		type: 'post',
		title,
		body,
		resource: postId,
	});
};

export const eventNotificationToParticipant = async (
	postId: string,
	user: string,
	type:
		| 'participationPermitted'
		| 'participationProhibited'
		| 'mayAskToParticipateAgain'
) => {
	let post = await PostsDBService.getPost({ _id: postId });

	let title = Notifications[type].title;
	let body = Notifications[type].body;

	await NotificationsDBService.createNotification({
		user: user,
		type: 'post',
		title,
		body,
		resource: postId,
	});
};

export const newFriendRequestNotification = async (
	to: string,
	from: string,
	type:
		| 'newFriendRequest'
		| 'requestAccepted',
	additionalString?: string
) => {
	let title = Notifications[type].title;
	let body = Notifications[type].body + additionalString;

	await NotificationsDBService.createNotification({
		user: to,
		type: 'post',
		title,
		body,
		resource: from,
	});
};
