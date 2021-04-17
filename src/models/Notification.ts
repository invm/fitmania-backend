const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    friend: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
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

const Notification = mongoose.model('notification', NotificationSchema);
export = Notification;
