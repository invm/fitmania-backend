import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, canJoinEvent } from './index';
import ENTITIES from '../models';

export = {
  joinEvent: [entityExists(ENTITIES.post, {}), canJoinEvent],
  leaveEvent: [entityExists(ENTITIES.event, {})],
};
