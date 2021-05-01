export {};
const express = require('express');
import Responder from '../utils/Responder';
import FriendsController from '../controllers/friends';
import FriendsValidator from '../validators/friends';

const router = express.Router();

router.get('/requests', FriendsValidator.getRequests, Responder(FriendsController.getRequests));

router.post(
  '/accept/:id',
  FriendsValidator.acceptRequest,
  Responder(FriendsController.acceptRequest)
);
router.post(
  '/reject/:id',
  FriendsValidator.rejectRequest,
  Responder(FriendsController.rejectRequest)
);
router.post('/add/:id', FriendsValidator.addFriend, Responder(FriendsController.addFriend));

router.post(
  '/remove/:id',
  FriendsValidator.removeFriend,
  Responder(FriendsController.removeFriend)
);

router.get('/suggestions', Responder(FriendsController.getFriendSuggestions));

router.get('/search', FriendsValidator.search, Responder(FriendsController.search));

module.exports = router;
