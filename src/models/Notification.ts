import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface INotification {
  type?: 'default' | 'friendRequest';
  title?: string;
  body?: string;
  from?: string;
  to?: string;
  read?: boolean;
  responded?: boolean;
}

export interface INotificationDoc extends mongoose.Document, INotification {}

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['default', 'friend'],
      default: 'default',
    },
    title: {
      type: String,
      maxlength: 100,
    },
    body: {
      type: String,
      maxlength: 200,
    },
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
    read: {
      type: Boolean,
      default: false,
    },
    responded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Notification = mongoose.model<INotificationDoc>('notification', NotificationSchema);
export default Notification;
