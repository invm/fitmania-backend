export {};
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IComment {
  post?: string;
  user?: string;
  text: string;
  created_at?: Date;
}

export interface ICommentDoc extends mongoose.Document, IComment {}

const CommentSchema = new Schema(
  {
    post: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'post',
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
      maxLength: 280,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Comment = mongoose.model<ICommentDoc>('comment', CommentSchema);
export default Comment;
