
// // @desc     Delete an event from post
// // @route    DELETE /api/posts/:id/event
// // @access   Private

// exports.removeEvent = async (req: any, res: Response, next: NextFunction) => {
//   const post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id != req._user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to remove this event' });
//   post.isEvent = false;
//   post.save();
//   res.status(200).json({ msg: 'Removed an event from the post' });
// };

// exports.removeFromRejectedList = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post || !post.isEvent)
//     return res
//       .status(404)
//       .json({ msg: 'No post found or the post is not an event.' });
//   if (String(post.user._id) !== String(req._user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => String(item) === userId
//     ) !== -1;
//   if (isRejected) {
//     post.event.rejectedParticipants.pull({ _id: entryId });
//     post.save();
//     return res.status(200).json({
//       msg: 'Removed from rejected list.',
//     });
//   }
// };

// exports.allowAdmitEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post || !post.isEvent)
//     return res
//       .status(404)
//       .json({ msg: 'No post found or the post is not an event.' });
//   if (String(post.user._id) !== String(req._user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === userId
//     ) === -1;
//   if (!isNotRejected) {
//     return res.status(400).json({
//       msg:
//         'This person has been rejected from that event, first remove him from the rejected list.',
//     });
//   }
//   let user = await User.findById(String(userId));
//   let participant = user._id;
//   post.event.participants.push(participant);
//   post.event.awaitingApprovalParticipants.pull({ _id: entryId });
//   post.save();
//   post = await Post.findById(req.params.id);
//   return res.status(200).json({ msg: 'Participant added', post });
// };

// exports.rejectAdmitEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (String(post.user._id) !== String(req._user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === userId
//     ) === -1;
//   if (!isNotRejected) {
//     return res.status(400).json({
//       msg:
//         'This person has been rejected from that event, first remove him from the rejected list.',
//     });
//   }
//   let user = await User.findById(req._user);
//   let participant = {
//     id: user._id,
//     avatar: user.avatar,
//     name: user.name,
//   };
//   post.event.rejectedParticipants.push(participant);
//   post.event.awaitingApprovalParticipants.pull({ _id: entryId });
//   post.save();
//   post = await Post.findById(req.params.id);
//   return res.status(200).json({ msg: 'Participant rejected.', post });
// };

// exports.askToJoinEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id == req._user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req._user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (
//     !post.event.openEvent &&
//     !post.event.participants.includes(req._user)
//   ) {
//     let user = await User.findById(req._user);
//     let participant = {
//       id: user._id,
//       avatar: user.avatar,
//       name: user.name,
//     };
//     post.event.awaitingApprovalParticipants.push(participant);
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res
//       .status(200)
//       .json({ msg: "You've asked to join the event", participant });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };

// exports.joinEvent = async (req: any, res: Response, next: NextFunction) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id == req._user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotAwaiting =
//     post.event.awaitingApprovalParticipants.findIndex(
//       (item: any) => item.toString() === req._user
//     ) === -1;
//   let isNotParticipant =
//     post.event.participants.findIndex(
//       (item: any) => item.toString() === req._user
//     ) === -1;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req._user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (post.event.openEvent && isNotAwaiting && isNotParticipant) {
//     let user = await User.findById(req._user);
//     let participant = {
//       id: user._id,
//       avatar: user.avatar,
//       name: user.name,
//     };
//     post.event.participants.push(participant);
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res
//       .status(200)
//       .json({ msg: "You've joined the event", participant });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };

// exports.leaveEvent = async (req: any, res: Response, next: NextFunction) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   let isParticipant =
//     post.event.participants.findIndex(
//       (item: any) => String(item.toString()) === String(req._user)
//     ) >= 0;
//   if (post.user._id == req._user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req._user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (isParticipant) {
//     const { entryId } = req.body;
//     post.event.participants.pull({ _id: entryId });
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res.status(200).json({ msg: "You've left the event" });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };