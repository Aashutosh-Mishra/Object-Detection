// components/AuthButton.tsx
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import { LogIn, LogOut, History, UserCircle, Loader } from 'lucide-react'; // Added icons

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
        <button
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            disabled
        >
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Loading...
        </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-3">
         {/* Optional: Display user info */}
         {/* <span className="text-sm text-gray-300 hidden sm:inline">
           {session.user?.name || session.user?.email}
         </span> */}
        <Link href="/history" legacyBehavior>
            <a title="View History" className="p-2 text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
                <History className="h-5 w-5" />
            </a>
        </Link>
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title="Sign Out"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
        onClick={() => signIn()} // Or link to /login: <Link href="/login">...</Link>
        title="Sign In"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-blue-400 transition-colors"
    >
      <LogIn className="h-4 w-4 sm:mr-1" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}