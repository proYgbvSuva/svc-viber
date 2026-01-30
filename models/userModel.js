import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  age: { type: Number, min: 1 },
  sex: { type: String, enum: ['male', 'female', 'other', null], default: null },
  heightCm: { type: Number, min: 1 },
  weightKg: { type: Number, min: 1 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  telegramUserId: { type: Number, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  profile: { type: profileSchema, default: () => ({}) },
  pendingFields: { type: [String], default: [] }, // now can include 'all'
});

export const User = mongoose.model('User', userSchema);
