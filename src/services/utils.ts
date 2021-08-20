import PostsDBService from './Posts';
import NotificationsDBService from './Notifications';

export const newCommentNotification = async (postId: string) => {
	let post = await PostsDBService.getPost({ _id: postId });

	let title = 'New comment';
	let body = 'Somebody just posted a new comment on your post, view it now!';

	await NotificationsDBService.createNotification({
		user: post.author,
		type: 'post',
		title,
		body,
		resource: postId,
	});
};
