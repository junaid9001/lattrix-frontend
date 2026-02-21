import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Signup from "../auth/Signup";
import Login from "../auth/Login";
import SelectWorkspace from "../auth/SelectWorkspace";
import ProtectedRoute from "./ProtectedRoutes";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import RBAC from "../pages/RBAC";
import ApiGroups from "../pages/ApiGroups";
import GroupDetails from "../pages/GroupDetails";
import Notifications from "../pages/notifications";
import Pricing from "../pages/Pricing";
import ApiMetrics from "../pages/ApiMetrics";
import AdminDashboard from "../pages/admin/AdminDashboard";

import VerifyOtp from "../auth/VerifyOtp";


function AppRoutes() {
  return (
    <>
     <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333', 
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#018f5f',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', 
              secondary: 'white',
            },
          },
        }}
      />
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select-workspace" element={<SelectWorkspace />} />

      <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="rbac" element={<RBAC />} />
        <Route path="api-groups" element={<ApiGroups />} />
        <Route path="api-groups/:id" element={<GroupDetails />} />
        <Route path="group/:groupId/api/:apiId" element={<ApiMetrics />} />
        <Route path="notifications" element={<Notifications/>}/>

        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </>
  );
}

export default AppRoutes;