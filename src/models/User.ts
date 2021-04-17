import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
  name: string;
  lastname: string;
  birthday?: Date;
  email: string;
  location?: string;
  avatar?: string;
  preferable?: string[];
  undesirable?: string[];
  otpData?: {
    token: string;
    expirationDate: Date;
  };
}

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
    avatar: {
      type: String,
      default: 'default.png',
    },
    preferable: [String],
    undesirable: [String],
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

const User = mongoose.model<IUser>('user', UserSchema);
export default User;
