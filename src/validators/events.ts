import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, canJoinEvent, postOwner } from './index';
import ENTITIES from '../models';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';

export = {
  removeFromRejectedList: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
      })
      .withMessage(Errors.A14)
      .bail(),
    check('userId')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost(
          { _id: req.params.id },
          { populate: { event: true } }
        );
        let event = await EventsDBService.getEvent({ _id: post.event });
        if (!event?.rejectedParticipants?.includes(val.toString())) {
          throw new Error();
        }
      })
      .withMessage(Errors.A30),
  ],
  askToJoinEvent: [],
  allowAdmitEvent: [],
  rejectAdmitEvent: [],
  joinEvent: [entityExists(ENTITIES.post, {}), canJoinEvent()],
  leaveEvent: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost({ _id: val }, { populate: { event: true } });
        let event = await EventsDBService.getEvent({ _id: post.event });
        if (
          post.author.toString() === req.user.toString() ||
          !event?.participants?.includes(req.user._id.toString())
        ) {
          throw new Error();
        }
      })
      .withMessage(Errors.A30),
  ],
};
