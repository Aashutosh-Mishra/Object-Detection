// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

type ResponseData = {
  message: string;
  userId?: string; // Optionally return userId on success
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Basic validation (add more robust validation as needed)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
     return res.status(400).json({ message: 'Invalid email format' });
  }


  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Create new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name || '', // Optional name
      // emailVerified: null, // Set if you implement verification
    });

    await newUser.save();

    console.log('User registered successfully:', newUser.email);
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id.toString() });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}