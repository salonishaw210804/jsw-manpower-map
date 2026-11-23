import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="center-page">
      <div className="signin-head">
        <div className="logo">JSW</div>
        <h1>India manpower potential map</h1>
        <p className="sub">Sign in with your JSW company email. You’ll get a code in Outlook.</p>
      </div>
      <SignIn routing="hash" fallbackRedirectUrl="/" />
    </main>
  );
}
