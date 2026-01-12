import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "../auth/Signup";
import Login from "../auth/Login";
import ProtectedRoute from "./ProtectedRoutes";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboar";
import RBAC from "../pages/Rbac";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Nested routes */}
        <Route index element={<Dashboard />} />
        <Route path="rbac" element={<RBAC />} />
        <Route path="api-groups" element={<div>API Groups (later)</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;
