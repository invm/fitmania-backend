import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, canJoinEvent, postOwner } from './index';
import ENTITIES from '../models';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';

export = {
  removeFromRejectedList: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A14)
      .bail()
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost({ _id: val }, { populate: { event: true } });
        let event = await EventsDBService.getEvent({ _id: post.event });
        req.event = event;
        if (new Date(req?.event?.startDate).getTime() < new Date().getTime()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A32)
      .bail(),
    check('user')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost(
          { _id: req.params.id },
          { populate: { event: true } }
        );
        let event = await EventsDBService.getEvent({ _id: post.event });
        if (!event?.rejectedParticipants?.includes(val.toString())) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A33),
  ],
  askToJoinEvent: [entityExists(ENTITIES.post, { required: true }), canJoinEvent()],
  allowAdmitEvent: [
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A14)
      .bail()
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost({ _id: val }, { populate: { event: true } });
        let event = await EventsDBService.getEvent({ _id: post.event });
        req.event = event;
        if (new Date(req?.event?.startDate).getTime() < new Date().getTime()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A32)
      .bail(),
    check('user')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost(
          { _id: req.params.id },
          { populate: { event: true } }
        );
        let event = await EventsDBService.getEvent({ _id: post.event });
        if (!event?.pendingApprovalParticipants?.includes(val.toString())) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A34),
  ],
  rejectAdmitEvent: [
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A14)
      .bail()
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost({ _id: val }, { populate: { event: true } });
        let event = await EventsDBService.getEvent({ _id: post.event });
        req.event = event;
        if (new Date(req?.event?.startDate).getTime() < new Date().getTime()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A32)
      .bail(),
    check('user')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost(
          { _id: req.params.id },
          { populate: { event: true } }
        );
        let event = await EventsDBService.getEvent({ _id: post.event });
        if (!event?.pendingApprovalParticipants?.includes(val.toString())) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A34),
  ],
  joinEvent: [
    entityExists(ENTITIES.post, { required: true }),
    canJoinEvent(),
    check('id')
      .custom(async (_id, { req }) => {
        // check if the event is open event
        req.post = await PostsDBService.getPost({ _id }, { populate: { event: true } });
        if (!req.post?.event?.openEvent) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A27)
      .bail(),
  ],
  leaveEvent: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let post = await PostsDBService.getPost({ _id: val }, { populate: { event: true } });
        let event = await EventsDBService.getEvent({ _id: post.event });
        req.event = event;
        if (
          post.author.toString() === req.user.toString() ||
          !event?.participants?.includes(req.user._id.toString())
        ) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A30)
      .custom((_, { req }) => {
        if (new Date(req.event.startDate).getTime() < new Date().getTime()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A32),
  ],
};
