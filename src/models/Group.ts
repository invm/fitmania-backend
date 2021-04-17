const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 100,
    },
    sport: {
      type: String,
      enum: [
        'Running',
        'Biking',
        'Soccer',
        'Basketball',
        'Rugby',
        'Hiking',
        'Tennis',
      ],
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

const Group = mongoose.model('group', GroupSchema);
export = Group;
