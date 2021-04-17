import express from 'express';
const router = express.Router();
import PostController from '../controllers/posts';
import CommentController from '../controllers/comments';
import { upload } from '../middleware';
import Responder from '../utils/Responder';

// router.get('/statistics', getStatistics);
// router.post('/:id/event/remove-from-rejected', removeFromRejectedList);
// router.post('/:id/event/ask-to-join', askToJoinEvent);
// router.post('/:id/event/allow', allowAdmitEvent);
// router.post('/:id/event/reject', rejectAdmitEvent);
// router.post('/:id/event/join', joinEvent);
// router.post('/:id/event/leave', leaveEvent);
// router.delete('/:id/event', removeEvent);

router.get('/:id/comments', Responder(CommentController.getComments));

router.post('/:id/comments');

router.patch('/:id/comments/:commentId', Responder(CommentController.editComment));

router.delete('/:id/comments/:commentId', Responder(CommentController.removeComment));

router.get('/user/:id', Responder(PostController.getUsersPosts));

router.get('/', Responder(PostController.getPosts)); // TODO: add validator of offset and limit

router.get('/:id', Responder(PostController.getPost)); // TODO: add validator of id

router.delete('/:id', Responder(PostController.deletePost)); // TODO: add validator of id

router.post('/', upload.single('postImage'), Responder(PostController.createPost)); // TODO: add validator of all field needed

router.put('/:id', upload.single('postImage'), Responder(PostController.updatePost)); // TODO: add validator of id and of all field needed

router.post('/:id/share', Responder(PostController.sharePost)); // TODO: add validator to see that the user is not the author and that has not been shared

router.post('/:id/unshare', Responder(PostController.unsharePost)); // TODO: add validator to see that the user is not the author and that the post was in fact shared by the user

router.post('/:id/like', Responder(PostController.likePost)); // TODO: add validator to see that the user is not the author and that has not been liked

router.post('/:id/dislike', Responder(PostController.dislikePost)); // TODO: add validator to see that the user is not the author and that the post was in fact liked by the user

module.exports = router;
