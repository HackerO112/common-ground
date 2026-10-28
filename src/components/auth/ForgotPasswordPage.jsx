import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthLink } from "@/components/auth/parts";

export function ForgotPasswordPage() {
  return (
    <AuthLayout icon={ArrowLeft} title="Password reset not available" subtitle="Use the login page to access your account">
      <p className="text-center text-sm text-foreground">Password reset is not configured for this standalone version.</p>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <AuthLink to="/login">
          <ArrowLeft className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Back to log in
        </AuthLink>
      </p>
    </AuthLayout>
  );
}
