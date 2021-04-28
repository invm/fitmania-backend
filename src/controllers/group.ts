import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group';
import User from '../models/User';
import Post from '../models/Post';
const authService = require('../services/authService');

// @desc     Get groups
// @route    GET /api/group
// @access   Private

exports.getGroups = async (req: Request, res: Response, next: NextFunction) => {
  let filter = {};
  if (req.query.sports) {
    filter = {
      sport: {
        $in: req.query.sports,
      },
    };
  }
  let result = await Group.find(filter)
    .limit(10)
    .skip(+req.query.page * 10)
    .populate('admin', 'name lastname avatar')
    .populate('users', 'name lastname avatar');
  return res.status(200).json({ result });
};

// @desc     Get group
// @route    GET /api/group/:id
// @access   Private

exports.getGroup = async (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    let result = await Group.findOne({ _id: req.params.id })
      .populate('admin', 'name lastname avatar')
      .populate('users', 'name lastname avatar');
    return res.status(200).json({ result });
  }
  return res.status(400).json({});
};

// @desc     Get featured groups, spits out 3 groups that match the users preferences, if less than 3 returned, gets random 3 groups.
// @route    GET /api/group/featured
// @access   Private

exports.getFeaturedGroups = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  let filter = {};
  let user = await User.findOne({ _id: req.user });
  if (user.preferable.length > 0)
    filter = {
      sport: {
        $in: user.preferable,
      },
    };

  let result = await Group.find(filter).limit(3);
  if (result.length < 3) {
    result = await Group.find({}).limit(3);
  }
  return res.status(200).json({ result });
};

// @desc     Get group posts
// @route    GET /api/group/posts/:id
// @access   Private

exports.getGroupPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    let result = await Post.find({ group: req.params.id })
      .populate('user', 'name lastname avatar')
      .populate('event.participants', 'name lastname avatar')
      .populate('event.initiator', 'name lastname avatar')
      .populate('event.rejectedParticipants', 'name lastname avatar')
      .populate('event.pendingApprovalParticipants', 'name lastname avatar')
      .populate('comments.user', 'name lastname _id')
      .exec();
    return res.status(200).json({ result });
  }
  return res.status(400).json({});
};

// @desc     Create group
// @route    POST /api/group
// @access   Private

exports.createGroup = async (req: any, res: Response, next: NextFunction) => {
  if (!req.body.sport && !req.body.title) {
    return res.status(400);
  }
  let result = await Group.create({
    title: req.body.title,
    sport: req.body.sport,
    users: [req.user],
    admin: req.user,
  });
  result = await Group.findOne({ _id: result._id })
    .populate('admin', 'name lastname avatar')
    .populate('users', 'name lastname avatar');
  return res.status(200).json({ result });
};

// @desc     Update group
// @route    PUT /api/group
// @access   Private

exports.updateGroup = async (req: any, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({});
  }
  let group = await Group.findOne({ _id: req.params.id });
  if (!group || group.admin.toString() !== req.user.toString())
    return res.status(400).json({});

  let updateParams: any = {};
  if (req.body.title) updateParams.title = req.body.title;
  if (req.body.sport) updateParams.sport = req.body.sport;

  await Group.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: updateParams,
    }
  );
  group = await Group.findOne({ _id: req.params.id })
    .populate('admin', 'name lastname avatar')
    .populate('users', 'name lastname avatar');

  return res.status(200).json({ result: group });
};

// @desc     Delete group
// @route    POST /api/group
// @access   Private

exports.deleteGroup = async (req: any, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({});
  }
  let group = await Group.findOne({ _id: req.params.id });
  if (!group || group.admin.toString() !== req.user.toString())
    return res.status(400).json({});
  await Group.deleteOne({ _id: req.params.id });
  return res.status(200).json({});
};

// @desc     Join group
// @route    POST /api/group/join/:id
// @access   Private

exports.joinGroup = async (req: any, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({});
  }
  let group = await Group.findOne({ _id: req.params.id });
  if (!group || group.users.includes(req.user.toString()))
    return res.status(400).json({});
  await Group.updateOne(
    { _id: req.params.id },
    {
      $push: {
        users: req.user,
      },
    }
  );
  return res.status(200).json({});
};

// @desc     Exit group
// @route    POST /api/group/exit/:id
// @access   Private

exports.leaveGroup = async (req: any, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({});
  }
  let group = await Group.findOne({ _id: req.params.id });
  if (
    !group ||
    !group.users.includes(req.user.toString()) ||
    group.admin.toString() === req.user.toString()
  )
    return res.status(400).json({});
  await Group.updateOne(
    { _id: req.params.id },
    {
      $pull: {
        users: req.user.toString(),
      },
    }
  );
  return res.status(200).json({});
};
