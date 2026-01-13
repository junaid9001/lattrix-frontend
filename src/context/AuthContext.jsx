import { createContext, useEffect, useState } from "react";
import { me } from "../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then((res) => {
        setUser(res.data.data);
      })
      .catch((err) => {
        // console.error("Auth check failed:", err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const role = user?.role;
  const permissions = user?.permissions || [];

  const isSuperAdmin = role === "superadmin" || permissions.includes("role:superadmin");

  const hasPermission = (permission) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList = []) => {
    if (isSuperAdmin) return true;
    return permissionList.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList = []) => {
    if (isSuperAdmin) return true;
    return permissionList.every((p) => permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,

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