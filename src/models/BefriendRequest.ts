export {};
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IBefriendRequest extends mongoose.Document {
  from: string;
  to: string;
  state: string;
}

const BefriendRequestSchema = new Schema(
  {
    from: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    to: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    state: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const BefriendRequest = mongoose.model<IBefriendRequest>(
  'befriendRequest',
  BefriendRequestSchema
);
export default BefriendRequest;
