import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "../auth/Signup";
import Login from "../auth/Login";
import SelectWorkspace from "../auth/SelectWorkspace"; // Import this
import ProtectedRoute from "./ProtectedRoutes";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import RBAC from "../pages/Rbac";
import ApiGroups from "../pages/ApiGroups"; // Created below
import GroupDetails from "../pages/GroupDetails";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select-workspace" element={<SelectWorkspace />} />

      <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="rbac" element={<RBAC />} />
        <Route path="api-groups" element={<ApiGroups />} />
        <Route path="api-groups/:id" element={<GroupDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppRoutes;