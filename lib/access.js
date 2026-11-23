import { currentUser } from '@clerk/nextjs/server';

const domains = () => (process.env.ALLOWED_EMAIL_DOMAINS || 'jsw.in')
  .split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

// Returns the signed-in user's verified company email, or null if they are not allowed in.
export async function getAllowedEmail() {
  const user = await currentUser();
  if (!user) return null;
  const allowed = domains();
  const ok = user.emailAddresses.find(e =>
    e.verification?.status === 'verified' &&
    allowed.includes(e.emailAddress.split('@').pop().toLowerCase()));
  return ok ? ok.emailAddress : null;
}

export async function signedInEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress || null;
}
