import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/app/AuthShell";
import { authAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <AuthShell mode="in">
      <SignIn fallbackRedirectUrl="/prep" signUpUrl="/sign-up" appearance={authAppearance} />
    </AuthShell>
  );
}
