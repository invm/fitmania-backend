import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number], // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
    required: true,
  },
});

export interface IEvent {
  startDate?: Date;
  eventType?:
    | 'Running'
    | 'Biking'
    | 'Soccer'
    | 'Basketball'
    | 'Rugby'
    | 'Hiking'
    | 'Tennis';
  initiator?: string;
  participants?: string[];
  limitParticipants?: number;
  pace?: string;
  openEvent?: boolean;
  rejectedParticipants?: string[];
  awaitingApprovalParticipants?: string[];
  created_at?: Date;
  location?: { type: string; coordinates: number[] };
}

export interface IEventDoc extends mongoose.Document, IEvent {}

const EventSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    eventType: {
      type: String,
      enum: [
        'Running',
        'Biking',
        'Soccer',
        'Basketball',
        'Rugby',
        'Hiking',
        'Tennis',
      ],
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
    limitParticipants: Number,
    pace: String,
    openEvent: { type: Boolean, required: true, default: true },
    rejectedParticipants: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
      },
    ],
    awaitingApprovalParticipants: [
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
