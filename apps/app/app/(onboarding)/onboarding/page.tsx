import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getOnboardingState } from '@/lib/actions/onboarding'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const state = await getOnboardingState()
  if (state?.completed) redirect('/dashboard')

  return <OnboardingClient initialState={state} userName={session.user?.name ?? ''} />
}
