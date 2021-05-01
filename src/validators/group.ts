import { check } from 'express-validator';
import { entityExists, paginationQuery } from '.';
import Errors from '../config/Errors';
import ENTITIES, { sportEnum } from '../models';
import GroupsDBService from '../services/Groups';

export = {
  getGroups: [
    ...paginationQuery,
    check('sports').optional().isString().withMessage(Errors.A0).bail(),
  ],
  getGroup: [entityExists(ENTITIES.group, { required: true })],
  getGroupPosts: [entityExists(ENTITIES.group, { required: true })],
  createGroup: [
    check('title').isString().isLength({ min: 2, max: 100 }).withMessage(Errors.A0).bail(),
    check('sport')
      .isString()
      .custom((val) => {
        console.log('sportEnum.includes(val)', sportEnum.includes(val));

        if (!sportEnum.includes(val)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A0)
      .bail(),
    check('description').optional().isString().isLength({ max: 200 }).withMessage(Errors.A0),
  ],
  updateGroup: [
    entityExists(ENTITIES.group, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let group = await GroupsDBService.getGroup({ _id: val }, {});

        if (group.admin.toString() !== req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A40)
      .bail(),
    check('title')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage(Errors.A0)
      .bail(),
    check('sport')
      .optional()
      .isString()
      .custom((val) => {
        if (!sportEnum.includes(val)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A0)
      .bail(),
    check('description').optional().isString().isLength({ max: 200 }).withMessage(Errors.A0),
  ],
  deleteGroup: [
    entityExists(ENTITIES.group, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let group = await GroupsDBService.getGroup({ _id: val }, {});

        if (group.admin.toString() !== req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A40)
      .bail(),
  ],
  joinGroup: [
    entityExists(ENTITIES.group, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let group = await GroupsDBService.getGroup({ _id: val }, {});
        req.group = group;
        if (group.admin.toString() === req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A41)
      .bail()
      .custom((_, { req }) => {
        if (req.group.users.includes(req.user._id.toString())) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A41)
      .bail(),
  ],
  leaveGroup: [
    entityExists(ENTITIES.group, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let group = await GroupsDBService.getGroup({ _id: val }, {});
        req.group = group;
        if (group.admin.toString() === req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A43)
      .bail()
      .custom((_, { req }) => {
        if (!req.group.users.includes(req.user._id.toString())) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A42)
      .bail(),
  ],
};
