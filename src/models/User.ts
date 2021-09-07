import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser {
  name: string;
  lastname: string;
  birthday?: Date;
  email: string;
  location?: string;
  image?: string;
  preferable?: string[];
  undesirable?: string[];
  fcmToken?: string;
  otpData?: {
    token: string;
    expirationDate: Date;
  };
}

export interface IUserDoc extends mongoose.Document, IUser {}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    birthday: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    location: { type: String },
    image: {
      type: String,
      default: 'default.png',
    },
    preferable: [String],
    undesirable: [String],
    fcmToken: String,
    otpData: {
      select: false,
      type: {
        token: {
          type: String,
        },
        expirationDate: {
          type: Date,
        },
        loginAttempts: {},
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

UserSchema.index({ location: 'text' }, { weights: { location: 5 } });

const User = mongoose.model<IUserDoc>('user', UserSchema);
export default User;
