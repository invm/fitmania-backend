export {};
const express = require('express');
const {
  requestToBeFriends,
  removeFriend,
  acceptRequest,
  declineRequest,
  search,
  getFriendSuggestions,
} = require('../controllers/social');
import { isAuthenticated } from '../middleware';
const router = express.Router();

const validate = [isAuthenticated];

router.get('/friends/suggestions', ...validate, getFriendSuggestions);
router.post('/friends/accept/:user', ...validate, acceptRequest);
router.post('/friends/decline/:user', ...validate, declineRequest);
router.post('/friends/add/:user', ...validate, requestToBeFriends);
router.post('/friends/remove/:user', ...validate, removeFriend);
router.get('/search', ...validate, search);

module.exports = router;
