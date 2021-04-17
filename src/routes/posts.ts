import express from 'express';
const router = express.Router();
import PostController from '../controllers/posts';
import { upload } from '../middleware';
import Responder from '../utils/Responder';

// router.get('/statistics', getStatistics);
// router.post(
//   '/:id/event/remove-from-rejected',
//
//   removeFromRejectedList
// );
// router.post('/:id/share', sharePost);
// router.post('/:id/unshare', unsharePost);
// router.post('/:id/like', likePost);
// router.post('/:id/dislike', dislikePost);
// router.post('/:id/event/ask-to-join', askToJoinEvent);
// router.post('/:id/event/allow', allowAdmitEvent);
// router.post('/:id/event/reject', rejectAdmitEvent);
// router.post('/:id/event/join', joinEvent);
// router.post('/:id/event/leave', leaveEvent);
// router.delete('/:id/event', removeEvent);
// router.get('/:id/comments', getComments);
// router.post('/:id/comments', createComment);
// router.put('/:id/comments', editComment);
// router.delete('/:id/comments', removeComment);
// router.get('/user/:id', getUsersPosts);
router.get('/', Responder(PostController.getPosts)); // TODO: add validator of offset and limit
router.get('/:id', Responder(PostController.getPost)); // TODO: add validator of id
router.delete('/:id', Responder(PostController.deletePost)); // TODO: add validator of id
router.post(
  '/',
  upload.single('postImage'),
  Responder(PostController.createPost)
); // TODO: add validator of all field needed
router.put(
  '/:id',
  upload.single('postImage'),
  Responder(PostController.updatePost)
); // TODO: add validator of id and of all field needed

module.exports = router;
