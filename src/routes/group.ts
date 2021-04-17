export {};
const express = require('express');
import { isAuthenticated } from '../middleware/';
const {
  getGroups,
  getGroup,
  getGroupPosts,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getFeaturedGroups,
} = require('../controllers/group');
const router = express.Router();

const validate = [isAuthenticated];

router.get('/featured', ...validate, getFeaturedGroups);
router.get('/', ...validate, getGroups);
router.get('/:id', ...validate, getGroup);
router.get('/posts/:id', ...validate, getGroupPosts);
router.post('/', ...validate, createGroup);
router.put('/:id', ...validate, updateGroup);
router.delete('/:id', ...validate, deleteGroup);
router.post('/join/:id', ...validate, joinGroup);
router.post('/leave/:id', ...validate, leaveGroup);

module.exports = router;
