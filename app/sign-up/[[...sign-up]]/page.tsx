import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/app/AuthShell";
import { authAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <AuthShell mode="up">
      <SignUp forceRedirectUrl="/tracks" signInUrl="/sign-in" appearance={authAppearance} />
    </AuthShell>
  );
}
