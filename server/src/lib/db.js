import mongoose from 'mongoose';

export async function connectDb() {
  await mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.DBNAME,
    autoCreate: true,
    autoIndex: true,
  });
  console.log('DB server connected successfully...');
}
