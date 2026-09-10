import { createContext, useContext } from "react";
import type { StaffRole } from "../lib/types";

export type { StaffRole } from "../lib/types";

export const AdminAccessContext = createContext<{ role: StaffRole } | null>(null);

export function useAdminAccess() {
  const access = useContext(AdminAccessContext);
  if (!access) throw new Error("useAdminAccess must be used inside AuthGate");
  return access;
}
