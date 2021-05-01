import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IGroup {
  title?: string;
  sport?: string;
  description?: string;
  admin?: string;
  users?: string[];
  created_at?: Date;
}

export interface IGroupDoc extends mongoose.Document, IGroup {}

const GroupSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 100,
    },
    sport: {
      type: String,
      enum: ['Running', 'Biking', 'Soccer', 'Basketball', 'Rugby', 'Hiking', 'Tennis'],
      default: 'Running',
    },
    description: {
      type: String,
      maxlength: 200,
    },
    admin: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
    },
    users: [
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

const Group = mongoose.model<IGroupDoc>('group', GroupSchema);
export default Group;
