import express from 'express';
const router = express.Router();
import PostController from '../controllers/posts';
import CommentController from '../controllers/comments';
import { upload } from '../middleware';
import Responder from '../utils/Responder';
import Validator from '../validators/posts';
import CommentsValidator from '../validators/comments';

// router.get('/statistics', getStatistics);
// router.post('/:id/event/remove-from-rejected', removeFromRejectedList);
// router.post('/:id/event/ask-to-join', askToJoinEvent);
// router.post('/:id/event/allow', allowAdmitEvent);
// router.post('/:id/event/reject', rejectAdmitEvent);
// router.post('/:id/event/join', joinEvent);
// router.post('/:id/event/leave', leaveEvent);
// router.delete('/:id/event', removeEvent);

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

router.get('/user/:id', Validator.getUsersPosts, Responder(PostController.getUsersPosts));

router.get('/', Validator.getPosts, Responder(PostController.getPosts));

router.get('/:id', Validator.getPost, Responder(PostController.getPost));

router.delete('/:id', Validator.deletePost, Responder(PostController.deletePost)); // TODO: add validator of id

router.post(
  '/',
  upload.single('postImage'),
  Validator.createPost,
  Responder(PostController.createPost)
);

router.put(
  '/:id',
  upload.single('postImage'),
  Validator.updatePost,
  Responder(PostController.updatePost)
); // TODO: add validator of id and of all field needed

router.post('/:id/share', Validator.sharePost, Responder(PostController.sharePost)); // TODO: add validator to see that the user is not the author and that has not been shared

router.post('/:id/unshare', Validator.unsharePost, Responder(PostController.unsharePost)); // TODO: add validator to see that the user is not the author and that the post was in fact shared by the user

router.post('/:id/like', Validator.likePost, Responder(PostController.likePost)); // TODO: add validator to see that the user is not the author and that has not been liked

router.post('/:id/dislike', Validator.dislikePost, Responder(PostController.dislikePost)); // TODO: add validator to see that the user is not the author and that the post was in fact liked by the user

module.exports = router;
