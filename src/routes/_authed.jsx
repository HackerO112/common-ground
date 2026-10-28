import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import AppLayout from "@/components/AppLayout";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});