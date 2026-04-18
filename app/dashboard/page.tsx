import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { cookies } from 'next/headers';
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login?returnTo=/dashboard');

  const cookieStore = await cookies();
  const raw = cookieStore.get('eco_analysis')?.value;

  if (!raw) redirect('/onboarding');

  let analysis;
  try {
    analysis = JSON.parse(raw);
  } catch {
    redirect('/onboarding');
  }

  return <Dashboard analysis={analysis} user={session.user} />;
}