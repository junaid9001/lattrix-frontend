import { createContext, useEffect, useState, useCallback } from "react"; // 1. Import useCallback
import { me } from "../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Create the reusable check function
  const checkAuth = useCallback(async () => {
    try {
      const res = await me();
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Use it in useEffect
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ... (keep your existing permissions logic here) ...
  const role = user?.role;
  const permissions = user?.permissions || [];
  const isSuperAdmin =
    role === "superadmin" || permissions.includes("role:superadmin");
  const hasPermission = (p) => isSuperAdmin || permissions.includes(p);
  const hasAnyPermission = (l) =>
    isSuperAdmin || l.some((p) => permissions.includes(p));
  const hasAllPermissions = (l) =>
    isSuperAdmin || l.every((p) => permissions.includes(p));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        checkAuth,
        role,
        isSuperAdmin,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
