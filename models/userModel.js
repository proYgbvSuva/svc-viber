// import mongoose from 'mongoose';

// const profileSchema = new mongoose.Schema({
//   name: { type: String, default: '' },
//   age: { type: Number },
//   sex: { type: String, enum: ['male','female','other','unknown'], default: 'unknown' },
//   heightCm: { type: Number },
//   weightLbs: { type: Number }
// }, { _id: false });

// const userSchema = new mongoose.Schema({
//   telegramUserId: { type: Number, unique: true, required: true },
//   createdAt: { type: Date, default: Date.now },
//   lastSeenAt: { type: Date, default: Date.now },
//   profile: { type: profileSchema, default: () => ({}) },
//   pendingFields: { type: [String], default: [] }
// });

// export const User = mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramUserId: { type: Number, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  profile: {
    name: { type: String, default: '' },
    age: { type: Number },
    sex: { type: String, default: null },
    heightCm: { type: Number },
    weightKg: { type: Number },
  },
  pendingFields: { type: [String], default: [] },
});

export const User = mongoose.model('User', userSchema);
