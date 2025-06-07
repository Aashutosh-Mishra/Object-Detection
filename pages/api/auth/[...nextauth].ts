// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb-client'; // Use client promise for adapter
import dbConnect from '../../../lib/mongodb'; // Use mongoose connection for checking user
import User from '../../../models/User'; // Removed { IUser } import as it's not used directly here
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  // Use MongoDB adapter with the clientPromise
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await dbConnect(); // Ensure DB connection (uses mongoose)

        // Find user using Mongoose model
        const user = await User.findOne({ email: credentials.email }).lean();

        if (!user) {
          console.log('No user found with email:', credentials.email);
          throw new Error('No user found with this email');
        }

        // Check if user has a password (might be OAuth user)
        if (!user.password) {
            console.log('User found but has no password (possibly OAuth account)');
            throw new Error('Credentials not valid for this account');
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          console.log('Password mismatch for user:', credentials.email);
          throw new Error('Incorrect password');
        }

        console.log('Credentials valid for:', user.email);
        // Return user object accepted by NextAuth, excluding password
        const { password, ...userWithoutPassword } = user;
         // We need to ensure the object structure matches what NextAuth expects after DB query
         // The adapter usually handles mapping, but let's ensure id is present if needed.
         // If User model uses default _id, adapter handles it. If custom id, ensure it's returned.
        return {
            id: user._id.toString(), // Ensure id is string
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified
         };
      }
    })
    // Add other providers like Google, GitHub here if needed
  ],
  session: {
    strategy: 'jwt', // Use JWT for session strategy
  },
  pages: {
    signIn: '/login', // Redirect users to /login page
  },
  callbacks: {
     // Include user id in the JWT token and session object
    async jwt({ token, user }) {
      // The user object is available on initial sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add id from token to session object
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Only export the NextAuth handler
export default NextAuth(authOptions);

// DO NOT INCLUDE THE MongoClient CODE HERE - IT BELONGS IN lib/mongodb-client.ts