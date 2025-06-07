// models/Detection.ts
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User'; // Import User interface for type hinting

interface IDetectionObject {
    label: string;
    confidence: number;
    // boundingBox?: [number, number, number, number]; // Optional: [x, y, width, height]
}

export interface IDetection extends Document {
  userId: Types.ObjectId | IUser; // Reference to the User
  timestamp: Date;
  modelUsed: string;
  detections: IDetectionObject[];
  imageUrl?: string; // Optional: store image if needed (consider storage implications)
}

const DetectionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Creates reference to User model
    required: true,
    index: true, // Index for faster history lookups
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true, // Index for sorting by time
  },
  modelUsed: {
    type: String,
    required: true,
  },
  detections: [{ // Array of detected objects
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    // boundingBox: { type: [Number], required: false }, // Optional
  }],
  imageUrl: { // Optional
    type: String,
  },
});

const Detection: Model<IDetection> = models.Detection || mongoose.model<IDetection>('Detection', DetectionSchema);

export default Detection;