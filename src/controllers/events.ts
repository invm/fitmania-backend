import { Request } from 'express';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';
import UsersDBService from '../services/Users';

const removeFromRejectedList = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent(
    { _id: post.event },
    {
      $pull: { rejectedParticipants: req.params.user },
    }
  );
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Participant can ask to join the event again.', post };
};

const allowAdmitEvent = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent(
    { _id: post.event },
    {
      $push: { participants: req.params.user },
      $pull: { pendingApprovalParticipants: req.params.user },
    }
  );
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Participant allowed.', post };
};

const rejectAdmitEvent = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent(
    { _id: post.event },
    {
      $push: { rejectedParticipants: req.params.user },
      $pull: { pendingApprovalParticipants: req.params.user },
    }
  );
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Participant rejected.', post };
};

const askToJoinEvent = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent(
    { _id: post.event },
    { $push: { pendingApprovalParticipants: req.user._id } }
  );
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Asked to join the event', post };
};

const joinEvent = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent({ _id: post.event }, { $push: { participants: req.user._id } });
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Joined the event', post };
};

const leaveEvent = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  await EventsDBService.updateEvent({ _id: post.event }, { $pull: { participants: req.user._id } });
  post = await PostsDBService.getPost(
    { _id: req.params.id },
    { populate: { author: true, comments: true, event: true, populateEventUsers: true } }
  );
  return { msg: 'Left the event', post };
};

export default {
  joinEvent,
  leaveEvent,
  removeFromRejectedList,
  allowAdmitEvent,
  rejectAdmitEvent,
  askToJoinEvent,
};
