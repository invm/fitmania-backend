import Event, { IEvent } from '../models/Event';
import { IObject } from '../types/IObject';

const createEvent = async (params: IEvent) => {
  return Event.create(params);
};

const deleteEvent = async (_id: string) => {
  return Event.deleteOne({ _id });
};

const exists = async (_id: string, filters: IObject) => {
  let result = await Event.findOne({ _id, ...filters }).lean();
  return !!result;
};

const getEvent = async (filter: IObject, options?: { populate: boolean }) => {
  let query = Event.findOne(filter);

  if (options?.populate) {
    query.populate(
      'participants rejectedParticipants pendingApprovalParticipants',
      '_id name lastname image'
    );
  }

  return query;
};

const updateEvent = async (filter: IObject, params: IObject) => {
  await Event.updateOne(filter, params);
};

const count = async (filter: IObject) => {
	return Event.countDocuments(filter);
};

export default { createEvent, updateEvent, deleteEvent, exists, getEvent, count };
