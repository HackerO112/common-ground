import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export function ResetPasswordPage() {
  return (
    <AuthLayout
      icon={AlertTriangle}
      title="Password reset not available"
      subtitle="Use the login page to access your account"
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Go to login
        </Link>
      }
    >
      <p className="text-center text-sm text-foreground">Password reset is not configured for this standalone version. Please contact your administrator.</p>
    </AuthLayout>
  );
}
