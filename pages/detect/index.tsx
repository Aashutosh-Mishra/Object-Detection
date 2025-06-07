import Head from "next/head"
import Yolo from "../../components/models/Yolo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import * as ort from 'onnxruntime-web';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"


export default function Detect() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true, // Require authentication for this page
    onUnauthenticated() {
      // Redirect to login page if not authenticated
      router.push('/login?callbackUrl=/detect');
    },
  });
 // ...
 if (status === "loading") {
   return <p>Loading session...</p>;
 }
  return (
    <>
      <Head>
        <title>Object Detection | Detect</title>
        <meta name="description" content="Real-time object detection using YOLO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="font-mono flex flex-col justify-center items-center w-screen">
        <div className="w-full max-w-7xl px-4">
          <Link href="/" className="inline-flex items-center mt-4 text-sm hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <h1 className="m-5 text-xl font-bold">Real-Time Object Detection</h1>

        <Yolo />

        <p className="m-5">
          Created by{" "}
          <a className="underline underline-offset-1 hover:translate-y-1" href="#">
            @22btrcn006/Aashutosh Mishra
          </a>
        </p>
      </main>
    </>
  )
}

