import mongoose from 'mongoose';
import { sportEnum } from '.';
const Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
      required: true,
    },
  },
  { _id: false }
);

export interface IEvent {
  startDate?: Date;
  eventType?: 'Running' | 'Biking' | 'Soccer' | 'Basketball' | 'Rugby' | 'Hiking' | 'Tennis';
  initiator?: string;
  participants?: string[];
  limitParticipants?: number;
  pace?: string;
  openEvent?: boolean;
  rejectedParticipants?: string[];
  pendingApprovalParticipants?: string[];
  created_at?: Date;
  location?: { type: string; coordinates: number[] };
}

export interface IEventDoc extends mongoose.Document, IEvent {}

const EventSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    eventType: {
      type: String,
      enum: sportEnum,
      default: 'Running',
    },
    initiator: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    participants: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
      },
    ],
    location: {
      type: pointSchema,
      required: true,
    },
    limitParticipants: { type: Number, required: true },
    pace: { type: String, required: true },
    openEvent: { type: Boolean, required: true, default: true },
    rejectedParticipants: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
      },
    ],
    pendingApprovalParticipants: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Event = mongoose.model<IEventDoc>('event', EventSchema);
export default Event;
