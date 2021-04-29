import express from 'express';
const router = express.Router();
import PostController from '../controllers/posts';
import CommentController from '../controllers/comments';
import EventController from '../controllers/events';
import { upload } from '../middleware';
import Responder from '../utils/Responder';
import PostValidator from '../validators/posts';
import CommentsValidator from '../validators/comments';
import EventsValidator from '../validators/events';

// router.get('/statistics', getStatistics);
router.post(
  '/:id/event/remove-from-rejected',
  EventsValidator.removeFromRejectedList,
  Responder(EventController.removeFromRejectedList)
);
router.post(
  '/:id/event/ask-to-join',
  EventsValidator.askToJoinEvent,
  Responder(EventController.askToJoinEvent)
);
router.post(
  '/:id/event/allow',
  EventsValidator.allowAdmitEvent,
  Responder(EventController.allowAdmitEvent)
);
router.post(
  '/:id/event/reject',
  EventsValidator.rejectAdmitEvent,
  Responder(EventController.rejectAdmitEvent)
);

router.post('/:id/event/join', EventsValidator.joinEvent, Responder(EventController.joinEvent));
router.post('/:id/event/leave', EventsValidator.leaveEvent, Responder(EventController.leaveEvent));

router.get(
  '/:id/comments',
  CommentsValidator.getComments,
  Responder(CommentController.getComments)
);

router.post(
  '/:id/comments',
  CommentsValidator.createComment,
  Responder(CommentController.createComment)
);

router.patch(
  '/:id/comments/:commentId',
  CommentsValidator.updateComment,
  Responder(CommentController.editComment)
);

router.delete(
  '/:id/comments/:commentId',
  CommentsValidator.deleteComment,
  Responder(CommentController.removeComment)
);

router.get('/user/:id', PostValidator.getUsersPosts, Responder(PostController.getUsersPosts));

router.get('/', PostValidator.getPosts, Responder(PostController.getPosts));

router.get('/:id', PostValidator.getPost, Responder(PostController.getPost));

router.delete('/:id', PostValidator.deletePost, Responder(PostController.deletePost)); // TODO: add validator of id

router.post(
  '/',
  upload.single('postImage'),
  PostValidator.createPost,
  Responder(PostController.createPost)
);

router.put(
  '/:id',
  upload.single('postImage'),
  PostValidator.updatePost,
  Responder(PostController.updatePost)
); // TODO: add validator of id and of all field needed

router.post('/:id/share', PostValidator.sharePost, Responder(PostController.sharePost)); // TODO: add validator to see that the user is not the author and that has not been shared

router.post('/:id/unshare', PostValidator.unsharePost, Responder(PostController.unsharePost)); // TODO: add validator to see that the user is not the author and that the post was in fact shared by the user

router.post('/:id/like', PostValidator.likePost, Responder(PostController.likePost)); // TODO: add validator to see that the user is not the author and that has not been liked

router.post('/:id/dislike', PostValidator.dislikePost, Responder(PostController.dislikePost)); // TODO: add validator to see that the user is not the author and that the post was in fact liked by the user

module.exports = router;
