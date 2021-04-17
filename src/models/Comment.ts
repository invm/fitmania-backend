export {};
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IComment extends mongoose.Document {
  post: string;
  user: string;
  text: string;
  created_at: Date;
}

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

const Comment = mongoose.model<IComment>('comment', CommentSchema);
export default Comment;
