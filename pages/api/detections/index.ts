// pages/api/detections/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // Adjust path if needed
import dbConnect from '../../../lib/mongodb';
import Detection from '../../../models/Detection';
import { Types } from 'mongoose';

type ResponseData = {
  message: string;
  detectionId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
      return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  await dbConnect();
  const userId = new Types.ObjectId(session.user.id); // Convert string ID to ObjectId

  if (req.method === 'POST') {
    // --- Save a new detection ---
    const { modelUsed, detections /*, imageUrl */ } = req.body;

    if (!modelUsed || !detections || !Array.isArray(detections)) {
      return res.status(400).json({ message: 'Missing required fields: modelUsed, detections array' });
    }

    // Basic validation of detection objects (add more as needed)
    if (detections.some(d => typeof d.label !== 'string' || typeof d.confidence !== 'number')) {
        return res.status(400).json({ message: 'Invalid format in detections array. Each object needs label (string) and confidence (number).' });
    }

    try {
      const newDetection = new Detection({
        userId: userId,
        modelUsed: modelUsed,
        detections: detections,
        // imageUrl: imageUrl || null, // Optional
        timestamp: new Date(), // Explicitly set timestamp
      });

      await newDetection.save();

      console.log(`Detection saved for user ${userId} with model ${modelUsed}`);
      res.status(201).json({ message: 'Detection saved successfully', detectionId: newDetection._id.toString() });

    } catch (error: any) {
      console.error('Error saving detection:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}