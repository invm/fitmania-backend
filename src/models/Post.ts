import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IPost {
  display?: 'friends' | 'all';
  group?: string;
  author?: string;
  sharedBy?: string[];
  text?: string;
  image?: string;
  event?: string;
  comments?: string[];
  likes?: string[];
  created_at?: Date;
}

interface IPostDoc extends mongoose.Document, IPost {}

const PostSchema = new Schema(
  {
    display: {
      type: String,
      enum: ['all', 'friends'],
      default: 'all',
    },
    group: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'group',
    },
    event: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'event',
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    sharedBy: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
      },
    ],
    text: {
      type: String,
      maxLength: 280,
    },
    image: {
      type: String,
    },
    comments: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'comment',
      },
    ],
    likes: [
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

const Post = mongoose.model<IPostDoc>('post', PostSchema);
export default Post;
