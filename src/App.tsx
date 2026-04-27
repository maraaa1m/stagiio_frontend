import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login              from "./components/Login";
import Register           from "./components/Register";
import ForgotPassword     from "./components/ForgotPassword";
import ResetPassword      from "./components/ResetPassword";
import ProfileSetup       from "./components/ProfileSetup";
import MediaSetup         from "./components/MediaSetup";
import StudentDashboard   from "./components/StudentDashboard";
import SearchOffers       from "./components/SearchOffers";
import OfferDetail        from "./components/OfferDetail";
import MyApplications     from "./components/MyApplications";
import StudentProfile     from "./components/StudentProfile";
import NotificationsPage  from "./components/NotificationsPage";
import CompanyDashboard   from "./components/CompanyDashboard";
import ManageOffers       from "./components/ManageOffers";
import CompanyApplications from "./components/CompanyApplications";
import CompanyProfile     from "./components/CompanyProfile";
import AdminDashboard     from "./components/AdminDashboard";
import AdminCompanies     from "./components/AdminCompanies";
import AdminAgreements    from "./components/AdminAgreements";
import AdminStatistics    from "./components/AdminStatistics";
import LandingPage        from "./components/LandingPage";
import AdminStudents      from "./components/AdminStudents";
import AdminApplications from "./components/AdminApplications";
import { ProfileGuardProvider } from "./lib/profileGuard";

export default function App() {
  return (
    <Router>
      <ProfileGuardProvider>
        <div className="min-h-screen selection:bg-blue-600 selection:text-white">
          {/* Subtle noise texture */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

          <Routes>
            {/* ── Public ──────────────────────────────────────────────────────── */}
            <Route path="/"                           element={<LandingPage />} />
            <Route path="/login"                      element={<Login />} />
            <Route path="/register"                   element={<Register />} />
            <Route path="/forgot-password"            element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

            {/* ── Student onboarding ───────────────────────────────────────────── */}
            <Route path="/profile/setup"              element={<ProfileSetup />} />
            <Route path="/profile/media"              element={<MediaSetup />} />

            {/* ── Student portal ───────────────────────────────────────────────── */}
            <Route path="/student/dashboard"          element={<StudentDashboard />} />
            <Route path="/student/offers"             element={<SearchOffers />} />
            <Route path="/student/offers/:id"         element={<OfferDetail />} />
            <Route path="/student/applications"       element={<MyApplications />} />
            <Route path="/student/profile"            element={<StudentProfile />} />
            <Route path="/student/notifications"      element={<NotificationsPage />} />

            {/* ── Company portal ───────────────────────────────────────────────── */}
            <Route path="/company/dashboard"          element={<CompanyDashboard />} />
            <Route path="/company/offers"             element={<ManageOffers />} />
            <Route path="/company/applications"       element={<CompanyApplications />} />
            <Route path="/company/profile"            element={<CompanyProfile />} />

            {/* ── Admin portal ─────────────────────────────────────────────────── */}
            <Route path="/admin/dashboard"            element={<AdminDashboard />} />
            <Route path="/admin/companies"            element={<AdminCompanies />} />
            <Route path="/admin/agreements"           element={<AdminAgreements />} />
            <Route path="/admin/statistics"           element={<AdminStatistics />} />
            <Route path="/admin/students"             element={<AdminStudents />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
          </Routes>
        </div>
      </ProfileGuardProvider>
    </Router>
  );
}