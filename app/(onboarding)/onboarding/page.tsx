import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = { title: "Configura tu negocio | Frandora" };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <OnboardingWizard />;
}
