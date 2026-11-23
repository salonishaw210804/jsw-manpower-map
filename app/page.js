import { UserButton } from '@clerk/nextjs';
import { getAllowedEmail, signedInEmail } from '@/lib/access';
import MapApp from './components/MapApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const email = await getAllowedEmail();
  if (!email) {
    const other = await signedInEmail();
    return (
      <main className="center-page">
        <div className="card denied">
          <h1>Access is limited to JSW company emails</h1>
          <p className="sub">You’re signed in as {other || 'an unknown account'}. Sign out and sign in again with your company email.</p>
          <div style={{ marginTop: 16 }}><UserButton /></div>
        </div>
      </main>
    );
  }
  return (
    <div className="app">
      <div className="top">
        <div className="brand">
          <div className="logo">JSW</div>
          <div>
            <h1>India manpower potential map</h1>
            <div className="sub">Market potential, JSW One business, manpower and upcoming projects by area</div>
          </div>
        </div>
        <div className="who"><span>Signed in as <b>{email}</b></span><UserButton /></div>
      </div>
      <MapApp askEnabled={!!process.env.ANTHROPIC_API_KEY} />
    </div>
  );
}
