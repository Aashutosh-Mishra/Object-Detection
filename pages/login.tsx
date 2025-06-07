// pages/login.tsx
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/detect'); // Or dashboard, or wherever logged-in users go
    }
  }, [status, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        console.error('Login failed:', result.error);
      } else if (result?.ok) {
        // Redirect to the page they were trying to access, or a default page
        const callbackUrl = router.query.callbackUrl || '/detect';
        router.push(callbackUrl as string);
      }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Login exception:', err);
    } finally {
        setLoading(false);
    }
  };

  if (status === 'loading') {
      return <p>Loading...</p>; // Or a loading spinner
  }

  // Don't render form if already authenticated (during potential redirect)
  if (status === 'authenticated') {
      return <p>Redirecting...</p>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don&apos;t have an account? <Link href="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;