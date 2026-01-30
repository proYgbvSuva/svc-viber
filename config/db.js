import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    console.log('MongoDB connection string:', process.env.MONGODB_URI);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
