import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ProfileSetup from "./components/ProfileSetup";
import MediaSetup from "./components/MediaSetup";
import StudentDashboard from "./components/StudentDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import LandingPage from "./components/LandingPage";
import SearchOffers from "./components/SearchOffers";
import OfferDetail from "./components/OfferDetail";
import MyApplications from "./components/MyApplications";
import StudentProfile from "./components/StudentProfile";
import CompanyProfile from "./components/CompanyProfile";
import ManageOffers from "./components/ManageOffers";
import CompanyApplications from "./components/CompanyApplications";
import AdminDashboard from "./components/AdminDashboard";
import AdminStudents from "./components/AdminStudents";
import AdminApplications from "./components/AdminApplications";
import AdminStudentDetail from "./components/AdminStudentDetail";
import AdminAgreements from "./components/AdminAgreements";
import AdminCompanies from "./components/AdminCompanies";
import AdminStatistics from "./components/AdminStatistics";
import NotificationsPage from "./components/NotificationsPage";
import ResetPassword from "./components/ResetPassword";
import { ProfileGuardProvider } from "./lib/profileGuard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ProfileGuardProvider>
        <div className="min-h-screen selection:bg-blue-600 selection:text-white">
          {/* Global Noise Texture Overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            
            {/* Student Routes */}
            <Route path="/profile/setup" element={<ProtectedRoute allowedRoles={['STUDENT']}><ProfileSetup /></ProtectedRoute>} />
            <Route path="/profile/media" element={<ProtectedRoute allowedRoles={['STUDENT']}><MediaSetup /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/offers" element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchOffers /></ProtectedRoute>} />
            <Route path="/student/offers/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><OfferDetail /></ProtectedRoute>} />
            <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['STUDENT', 'COMPANY', 'ADMIN']}><NotificationsPage /></ProtectedRoute>} />
            
            {/* Company Routes */}
            <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/profile" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyProfile /></ProtectedRoute>} />
            <Route path="/company/offers" element={<ProtectedRoute allowedRoles={['COMPANY']}><ManageOffers /></ProtectedRoute>} />
            <Route path="/company/applications" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyApplications /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/students/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudentDetail /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApplications /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/agreements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAgreements /></ProtectedRoute>} />
            <Route path="/admin/statistics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStatistics /></ProtectedRoute>} />
          </Routes>
        </div>
      </ProfileGuardProvider>
    </Router>
  );
}
