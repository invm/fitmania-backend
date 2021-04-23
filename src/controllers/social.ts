// import { Request, Response, NextFunction } from 'express';
// import User from '../models/User';
// import Notification from '../models/Notification';
// import Group from '../models/Group';

// // @desc     Ask another user to join friend list
// // @route    POST /social/friends/add/:user
// // @access   Private

// exports.requestToBeFriends = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let user = await User.findById(req.user);
//   let friend = await User.findById(req.params.user);
//   if (!user || !friend)
//     return res.status(400).json({ success: false, msg: 'No user found.' });

//   if (user.myBefriendRequests.includes(friend._id.toString()))
//     return res.status(400).json({
//       success: false,
//       msg: "You've already asked this user to be your friend.",
//     });

//   user.myBefriendRequests.push(friend._id);
//   friend.awaitingFriendRequest.push(user._id);
//   await user.save();
//   await friend.save();

//   await Notification.create({
//     user: friend._id,
//     type: 'friend',
//     friend: user._id,
//     title: 'New friend request!',
//     body: `You've received a new friend request from ${friend.name}.`,
//   });

//   return res.status(200).json({ success: true });
// };

// // @desc     Remove friend from friend list
// // @route    POST /social/friends/remove/:user
// // @access   Private

// exports.removeFriend = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   let friend = await User.findById(req.params.user);
//   if (!user || !friend)
//     return res.status(400).json({ success: false, msg: 'No user found.' });

//   if (!user.friends.includes(friend._id.toString()))
//     return res.status(400).json({
//       success: false,
//       msg: 'This person is not your friend.',
//     });

//   user.friends.pull(friend._id);
//   friend.friends.pull(user._id);

//   await user.save();
//   await friend.save();

//   return res.status(200).json({ success: true });
// };

// // @desc     Decline befriend request
// // @route    POST /social/friends/decline/:user
// // @access   Private

// exports.declineRequest = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let user = await User.findById(req.user);
//   let friend = await User.findById(req.params.user);
//   if (!user || !friend)
//     return res.status(400).json({ success: false, msg: 'No user found.' });

//   if (!user.awaitingFriendRequest.includes(friend._id.toString()))
//     return res.status(400).json({
//       success: false,
//       msg: 'This person did not ask to befriend you.',
//     });

//   await User.updateOne(
//     { _id: req.user },
//     {
//       $pull: {
//         awaitingFriendRequest: friend._id,
//       },
//     }
//   );

//   await User.updateOne(
//     { _id: req.params.user },
//     {
//       $pull: {
//         myBefriendRequests: user._id,
//       },
//     }
//   );

//   await Notification.updateOne(
//     { _id: req.body.notificationId },
//     {
//       responded: true,
//       read: true,
//     }
//   );

//   return res.status(200).json({ success: true });
// };

// // @desc     Accept befriend request
// // @route    POST /social/friends/accept/:user
// // @access   Private

// exports.acceptRequest = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   let friend = await User.findById(req.params.user);
//   if (!user || !friend)
//     return res.status(400).json({ success: false, msg: 'No user found.' });

//   if (!user.awaitingFriendRequest.includes(friend._id.toString()))
//     return res.status(400).json({
//       success: false,
//       msg: 'This person did not ask to befriend you.',
//     });

//   user.friends.push(friend._id);
//   friend.friends.push(user._id);

//   user.myBefriendRequests.pull(friend._id);
//   user.awaitingFriendRequest.pull(friend._id);
//   friend.awaitingFriendRequest.pull(user._id);
//   friend.myBefriendRequests.pull(user._id);
//   await user.save();
//   await friend.save();

//   await Notification.updateOne(
//     { _id: req.body.notificationId },
//     {
//       responded: true,
//       read: true,
//     }
//   );

//   return res.status(200).json({ success: true });
// };

// // @desc     Search for friends and groups
// // @route    GET /social/search?q=''
// // @access   Private

// exports.search = async (req: any, res: Response, next: NextFunction) => {
//   let query = req.query.q;
//   if (!query) return res.status(200).json({ success: true });
//   let user = await User.findById(req.user);
//   let users = await User.find({
//     $and: [
//       {
//         _id: {
//           $nin: [user._id],
//         },
//       },
//       {
//         $or: [
//           { name: { $regex: query, $options: 'i' } },
//           { lastname: { $regex: query, $options: 'i' } },
//           { email: { $regex: query, $options: 'i' } },
//           { location: { $regex: query, $options: 'i' } },
//         ],
//       },
//     ],
//   }).select('avatar name lastname email location');

//   let groups = await Group.find({
//     $and: [
//       {
//         $or: [
//           { title: { $regex: query, $options: 'i' } },
//           { description: { $regex: query, $options: 'i' } },
//           { sport: { $regex: query, $options: 'i' } },
//         ],
//       },
//     ],
//   }).select('title sport description users');

//   return res.status(200).json({ success: true, users, groups });
// };
// // @desc     Get friends suggestions based on your sport preferences and location
// // @route    GET /social/friends/suggestions
// // @access   Private

// exports.getFriendSuggestions = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let user = await User.findById(req.user);
//   let users = await User.find({
//     $and: [
//       {
//         _id: {
//           $nin: [
//             ...user.friends,
//             user._id,
//             ...user.myBefriendRequests,
//             ...user.awaitingFriendRequest,
//           ],
//         },
//       },
//       {
//         $or: [
//           { location: { $regex: user.location, $options: 'i' } },
//           {
//             preferable: {
//               $elemMatch: {
//                 $in: user.preferable,
//               },
//             },
//           },
//         ],
//       },
//     ],
//   })
//     .select('avatar name lastname email location preferable')
//     .limit(2);

//   return res.status(200).json({ success: true, users });
// };
