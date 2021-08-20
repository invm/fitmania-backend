import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface INotification {
	type?: 'post' | 'friend';
	title?: string;
	body?: string;
	read?: boolean;
	user: string;
	resource: string;
}

export interface INotificationDoc extends mongoose.Document, INotification {}

const NotificationSchema = new Schema(
	{
		type: {
			type: String,
			enum: ['post', 'friend'],
			default: 'post',
		},
		title: {
			type: String,
			maxlength: 100,
		},
		body: {
			type: String,
			maxlength: 200,
		},
		read: {
			type: Boolean,
			default: false,
		},
		user: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'user',
			required: true,
		},
		resource: {
			type: String,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const Notification = mongoose.model<INotificationDoc>(
	'notification',
	NotificationSchema
);
export default Notification;
