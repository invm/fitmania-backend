import Event, { IEvent } from '../models/Event';

const createEvent = async (params: IEvent) => {
  return Event.create(params);
};

export default { createEvent };
