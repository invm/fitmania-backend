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

router.get('/statistics', Responder(PostController.getStatistics));

router.get(
  '/:id/event/remove-from-rejected/:user',
  EventsValidator.removeFromRejectedList,
  Responder(EventController.removeFromRejectedList)
);
router.get(
  '/:id/event/ask-to-join',
  EventsValidator.askToJoinEvent,
  Responder(EventController.askToJoinEvent)
);
router.get(
  '/:id/event/allow/:user',
  EventsValidator.allowAdmitEvent,
  Responder(EventController.allowAdmitEvent)
);
router.get(
  '/:id/event/reject/:user',
  EventsValidator.rejectAdmitEvent,
  Responder(EventController.rejectAdmitEvent)
);

router.get('/:id/event/join', EventsValidator.joinEvent, Responder(EventController.joinEvent));
router.get('/:id/event/leave', EventsValidator.leaveEvent, Responder(EventController.leaveEvent));

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

router.delete('/:id', PostValidator.deletePost, Responder(PostController.deletePost));

router.post(
  '/',
  upload.single('postImage'),
  PostValidator.createPost,
  Responder(PostController.createPost)
);

router.patch('/:id', PostValidator.updatePost, Responder(PostController.updatePost));

router.get('/:id/share', PostValidator.sharePost, Responder(PostController.sharePost));

router.get('/:id/unshare', PostValidator.unsharePost, Responder(PostController.unsharePost));

router.get('/:id/like', PostValidator.likePost, Responder(PostController.likePost));

router.get('/:id/dislike', PostValidator.dislikePost, Responder(PostController.dislikePost));

module.exports = router;
