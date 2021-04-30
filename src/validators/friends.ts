import { check } from 'express-validator';
import { entityExists, paginationQuery } from '.';
import Errors from '../config/Errors';
import ENTITIES from '../models';
import FriendsDBService from '../services/Friends';

export = {
  getRequests: [...paginationQuery],
  acceptRequest: [
    check('id')
      .custom(async (val, { req }) => {
        let request = await FriendsDBService.getRequest(val, req.user._id, 'pending');
        if (!request) throw new Error();
      })
      .withMessage(Errors.A38)
      .bail(),
  ],
  rejectRequest: [
    check('id')
      .custom(async (val, { req }) => {
        let request = await FriendsDBService.getRequest(val, req.user._id, 'pending');
        if (!request) throw new Error();
      })
      .withMessage(Errors.A38)
      .bail(),
  ],
  addFriend: [
    check('id')
      .custom(async (val, { req }) => {
        let iAsked = await FriendsDBService.getRequest(req.user._id, val, {
          $in: ['pending', 'accepted'],
        });
        let heAsked = await FriendsDBService.getRequest(val, req.user._id, {
          $in: ['pending', 'accepted'],
        });
        if (iAsked || heAsked) throw new Error();
      })
      .withMessage(Errors.A35)
      .bail(),
  ],
  removeFriend: [
    check('id')
      .custom(async (val, { req }) => {
        let request = await FriendsDBService.getRequest(val, req.user._id, 'accepted');
        if (!request) throw new Error();
      })
      .withMessage(Errors.A39)
      .bail(),
  ],
};
