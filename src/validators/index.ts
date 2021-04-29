import { check } from 'express-validator';
import Errors from '../config/Errors';
import { IObject } from '../types/IObject';
import ENTITIES from '../models';
import UserDBService from '../services/User';
import PostsDBService from '../services/Posts';
import CommentDBService from '../services/Comment';
import EventDBService from '../services/Events';
import FriendsDBService from '../services/Friends';

const paginationQuery = [
  check('offset').exists().withMessage(Errors.A3).bail(),
  check('limit').exists().withMessage(Errors.A4).bail(),
];

const postOwner = async (postId: string, userId: string) => {
  return !!(await PostsDBService.getPost({ _id: postId, author: userId }));
};

const checkIfLiked = async (_id: string, userId: string) => {
  return !!(await PostsDBService.checkIfLiked(_id, userId));
};

const checkIfShared = async (_id: string, userId: string) => {
  return !!(await PostsDBService.checkIfShared(_id, userId));
};

const canJoinEvent = () => {
  const validator = check('id')
    .custom(async (_id, { req }) => {
      // check if the post is also an event
      req.post = await PostsDBService.getPost({ _id }, { populate: { event: true } });
      if (!req?.post?.event) {
        throw new Error();
      }
    })
    .withMessage(Errors.A23)
    .bail()
    .custom(async (_id, { req }) => {
      // check if the author is the user trying to join
      if (req?.post?.author?.toString() === req.user._id.toString()) {
        throw new Error();
      }
    })
    .withMessage(Errors.A24)
    .bail()
    .custom(async (_id, { req }) => {
      // check if the user is not in pending list
      if (req?.post?.event?.pendingApprovalParticipants?.includes(req.user._id.toString())) {
        throw new Error();
      }
    })
    .withMessage(Errors.A25)
    .bail()
    .custom(async (_id, { req }) => {
      // check if the user is not a participant
      if (req?.post?.event?.participants?.includes(req.user._id.toString())) {
        throw new Error();
      }
    })
    .withMessage(Errors.A29)
    .bail()
    .custom(async (_id, { req }) => {
      //  check if the user is not in rejected list
      if (req?.post?.event?.rejectedParticipants?.includes(req.user._id.toString())) {
        throw new Error();
      }
    })
    .withMessage(Errors.A26)
    .bail()
    .custom(async (_id, { req }) => {
      // check if the event is open event
      // check if the event is close event and the user is a friend of the author
      let areFriends = await FriendsDBService.areFriends(req.user._id, req.post.author);
      if (!req?.post?.event?.openEvent && !areFriends) {
        throw new Error();
      }
    })
    .withMessage(Errors.A27)
    .bail()
    .custom(async (_id, { req }) => {
      // check if the event has any room left for user
      if (!(req?.post?.event?.participants?.length < req.post?.event?.limitParticipants)) {
        throw new Error();
      }
    })
    .withMessage(Errors.A28)
    .bail();

  return validator;
};

const entityExists = (
  entity: string,
  { filter, fieldName, required }: { filter?: IObject; fieldName?: string; required?: boolean }
) => {
  const validator = check(fieldName ? fieldName : 'id')
    .isString()
    .withMessage(Errors.A0)
    .bail()
    .isMongoId()
    .withMessage(Errors.A10)
    .bail() // ID must be a valid MongoDB ID
    .custom(async (val) => {
      let exists;
      switch (entity) {
        case ENTITIES.user:
          exists = await UserDBService.exists(val, filter);
          break;
        case ENTITIES.post:
          exists = await PostsDBService.exists(val, filter);
          break;
        case ENTITIES.comment:
          exists = await CommentDBService.exists(val, filter);
          break;
        case ENTITIES.event:
          exists = await EventDBService.exists(val, filter);
          break;
        default:
          break;
      }

      if (!exists) {
        throw new Error();
      }
    })
    .withMessage(Errors.A12); // The ID must belong to an existing entity

  if (required) {
    validator.exists().withMessage(Errors.A13).bail(); // An ID is required to get details of an entity
  } else {
    validator.optional();
  }

  return validator;
};

export { paginationQuery, entityExists, postOwner, checkIfShared, checkIfLiked, canJoinEvent };
