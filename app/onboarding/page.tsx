import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import OnboardingWizard from '@/components/OnboardingWizard';

export default async function OnboardingPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login?returnTo=/onboarding');

  return <OnboardingWizard user={session.user} />;
}