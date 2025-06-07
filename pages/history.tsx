// pages/history.tsx
import { getSession } from 'next-auth/react'; // Use getSession on client if needed, or getServerSession in getServerSideProps
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]"; // Adjust path
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import dbConnect from '../lib/mongodb';
import Detection, { IDetection } from '../models/Detection';
import { Types } from 'mongoose';
import Link from 'next/link'; // For navigation

// Define shape of props returned by getServerSideProps
type HistoryProps = {
  detections: string; // Pass serialized data
};

export const getServerSideProps: GetServerSideProps<HistoryProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user?.id) {
    console.log("No session found, redirecting to login.");
    return {
      redirect: {
        destination: '/login?callbackUrl=/history',
        permanent: false,
      },
    };
  }

  try {
    await dbConnect();
    const userId = new Types.ObjectId(session.user.id);

    const userDetections = await Detection.find({ userId: userId })
                                        .sort({ timestamp: -1 }) // Sort by newest first
                                        .limit(50) // Limit results for performance
                                        .lean(); // Get plain JS objects

    // IMPORTANT: Serialize data before passing to page props
    // Dates and ObjectIds are not directly serializable by Next.js JSON
    const serializedDetections = JSON.stringify(userDetections);


    return {
      props: { detections: serializedDetections },
    };
  } catch (error) {
      console.error("Error fetching history in getServerSideProps:", error);
      // Return empty array or handle error state in props
      return { props: { detections: JSON.stringify([]) } };
  }
};

// Page component receives props from getServerSideProps
const HistoryPage = ({ detections }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // IMPORTANT: Parse the serialized data back into an object array
  const parsedDetections: IDetection[] = JSON.parse(detections);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Detection History</h1>
      <Link href="/detect">Back to Detection</Link>

      {parsedDetections.length === 0 ? (
        <p>No detection history found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {parsedDetections.map((record) => (
            <li key={record._id.toString()} style={{ border: '1px solid #eee', marginBottom: '15px', padding: '10px', borderRadius: '5px' }}>
              <p>
                <strong>Date:</strong> {new Date(record.timestamp).toLocaleString()} <br />
                <strong>Model:</strong> {record.modelUsed}
              </p>
              <strong>Detections:</strong>
              <ul>
                {record.detections.map((det, index) => (
                  <li key={index}>
                    {det.label}: {(det.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;