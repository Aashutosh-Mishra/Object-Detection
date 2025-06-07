import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IUser extends Document {
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, 
  },
  emailVerified: {
    type: Date,
  },
  image: {
    type: String,
  },
  password: { 
    type: String,
  },
}, { timestamps: true }); 
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;