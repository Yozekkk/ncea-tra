import { createContext, useContext } from "react";

export type StaffRole = "moderator" | "admin";

export const AdminAccessContext = createContext<{ role: StaffRole } | null>(null);

export function useAdminAccess() {
  const access = useContext(AdminAccessContext);
  if (!access) throw new Error("useAdminAccess must be used inside AuthGate");
  return access;
}
