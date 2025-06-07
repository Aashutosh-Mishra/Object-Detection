// pages/_app.tsx
import '../styles/globals.css'; // Adjust path if needed
import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}