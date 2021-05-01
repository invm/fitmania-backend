import express from 'express';
import GroupsController from '../controllers/group';
import GroupsValidator from '../validators/group';
import Responder from '../utils/Responder';

const router = express.Router();

router.get('/featured', Responder(GroupsController.getFeaturedGroups));

router.get('/', GroupsValidator.getGroups, Responder(GroupsController.getGroups));

router.get('/:id', GroupsValidator.getGroup, Responder(GroupsController.getGroup));

router.get('/posts/:id', GroupsValidator.getGroupPosts, Responder(GroupsController.getGroupPosts));

router.post('/', GroupsValidator.createGroup, Responder(GroupsController.createGroup));

router.put('/:id', GroupsValidator.updateGroup, Responder(GroupsController.updateGroup));

router.delete('/:id', GroupsValidator.deleteGroup, Responder(GroupsController.deleteGroup));

router.post('/join/:id', GroupsValidator.joinGroup, Responder(GroupsController.joinGroup));

router.post('/leave/:id', GroupsValidator.leaveGroup, Responder(GroupsController.leaveGroup));

module.exports = router;
