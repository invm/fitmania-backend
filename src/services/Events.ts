import Event, { IEvent } from '../models/Event';

const createEvent = async (params: IEvent) => {
  return Event.create(params);
};

const deleteEvent = async (_id: string) => {
  return Event.deleteOne({ _id });
};

export default { createEvent, deleteEvent };
