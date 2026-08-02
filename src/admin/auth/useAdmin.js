import { useContext } from "react";

import { AdminAuthContext } from "./authProvider";

/**
 * Single hook for admin pages. Do not call Supabase Auth from pages.
 * Must be used under AdminAuthProvider.
 */
export function useAdmin() {
  const value = useContext(AdminAuthContext);
  if (!value) {
    throw new Error("useAdmin must be used within AdminAuthProvider.");
  }
  return value;
}
