import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import TempleInfo from './pages/public/TempleInfo';
import DarshanOverview from './pages/public/DarshanOverview';
import LiveCrowdPublic from './pages/public/LiveCrowdPublic';
import HelpContact from './pages/public/HelpContact';

// Pilgrim Pages
import PilgrimDashboard from './pages/pilgrim/PilgrimDashboard';
import BookDarshan from './pages/pilgrim/BookDarshan';
import BookingDetails from './pages/pilgrim/BookingDetails';
import PilgrimBookings from './pages/pilgrim/PilgrimBookings';
import PilgrimProfile from './pages/pilgrim/PilgrimProfile';
import PilgrimEmergency from './pages/pilgrim/PilgrimEmergency';
import PilgrimLostFound from './pages/pilgrim/PilgrimLostFound';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffQrScanner from './pages/staff/StaffQrScanner';
import StaffQueueControl from './pages/staff/StaffQueueControl';
import StaffEmergencies from './pages/staff/StaffEmergencies';
import StaffTasks from './pages/staff/StaffTasks';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStaff from './pages/admin/AdminStaff';
import AdminDarshanSlots from './pages/admin/AdminDarshanSlots';
import AdminCrowdMonitoring from './pages/admin/AdminCrowdMonitoring';
import AdminQueueManagement from './pages/admin/AdminQueueManagement';
import AdminFestivals from './pages/admin/AdminFestivals';
import AdminEmergencies from './pages/admin/AdminEmergencies';
import AdminLostFound from './pages/admin/AdminLostFound';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Layout with Sidebar for Authenticated Areas
const AppLayout = ({ children, withSidebar = false }) => {
  return (
    <div className="page-wrapper">
      <Navbar />
      {withSidebar ? (
        <div className="dashboard-layout">
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
            <Footer />
          </div>
        </div>
      ) : (
        <>
          {children}
          <Footer />
        </>
      )}
      <ChatbotWidget />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/login" element={<AppLayout><Login defaultRole="PILGRIM" /></AppLayout>} />
            <Route path="/staff/login" element={<AppLayout><Login defaultRole="STAFF" /></AppLayout>} />
            <Route path="/admin/login" element={<AppLayout><Login defaultRole="ADMIN" /></AppLayout>} />
            <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
            <Route path="/forgot-password" element={<AppLayout><ForgotPassword /></AppLayout>} />
            <Route path="/temple" element={<AppLayout><TempleInfo /></AppLayout>} />
            <Route path="/darshan" element={<AppLayout><DarshanOverview /></AppLayout>} />
            <Route path="/crowd" element={<AppLayout><LiveCrowdPublic /></AppLayout>} />
            <Route path="/help" element={<AppLayout><HelpContact /></AppLayout>} />

            {/* PILGRIM PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['PILGRIM', 'STAFF', 'ADMIN']} />}>
              <Route path="/user/dashboard" element={<AppLayout withSidebar><PilgrimDashboard /></AppLayout>} />
              <Route path="/user/book-darshan" element={<AppLayout withSidebar><BookDarshan /></AppLayout>} />
              <Route path="/user/bookings" element={<AppLayout withSidebar><PilgrimBookings /></AppLayout>} />
              <Route path="/user/booking/:id" element={<AppLayout withSidebar><BookingDetails /></AppLayout>} />
              <Route path="/user/profile" element={<AppLayout withSidebar><PilgrimProfile /></AppLayout>} />
              <Route path="/user/emergency" element={<AppLayout withSidebar><PilgrimEmergency /></AppLayout>} />
              <Route path="/user/lost-found" element={<AppLayout withSidebar><PilgrimLostFound /></AppLayout>} />
            </Route>

            {/* STAFF PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
              <Route path="/staff/dashboard" element={<AppLayout withSidebar><StaffDashboard /></AppLayout>} />
              <Route path="/staff/qr-scanner" element={<AppLayout withSidebar><StaffQrScanner /></AppLayout>} />
              <Route path="/staff/queue" element={<AppLayout withSidebar><StaffQueueControl /></AppLayout>} />
              <Route path="/staff/emergency" element={<AppLayout withSidebar><StaffEmergencies /></AppLayout>} />
              <Route path="/staff/tasks" element={<AppLayout withSidebar><StaffTasks /></AppLayout>} />
            </Route>

            {/* ADMIN PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AppLayout withSidebar><AdminDashboard /></AppLayout>} />
              <Route path="/admin/users" element={<AppLayout withSidebar><AdminUsers /></AppLayout>} />
              <Route path="/admin/staff" element={<AppLayout withSidebar><AdminStaff /></AppLayout>} />
              <Route path="/admin/darshan" element={<AppLayout withSidebar><AdminDarshanSlots /></AppLayout>} />
              <Route path="/admin/crowd" element={<AppLayout withSidebar><AdminCrowdMonitoring /></AppLayout>} />
              <Route path="/admin/queue" element={<AppLayout withSidebar><AdminQueueManagement /></AppLayout>} />
              <Route path="/admin/festivals" element={<AppLayout withSidebar><AdminFestivals /></AppLayout>} />
              <Route path="/admin/emergency" element={<AppLayout withSidebar><AdminEmergencies /></AppLayout>} />
              <Route path="/admin/lost-found" element={<AppLayout withSidebar><AdminLostFound /></AppLayout>} />
              <Route path="/admin/notifications" element={<AppLayout withSidebar><AdminNotifications /></AppLayout>} />
              <Route path="/admin/reports" element={<AppLayout withSidebar><AdminReports /></AppLayout>} />
              <Route path="/admin/settings" element={<AppLayout withSidebar><AdminSettings /></AppLayout>} />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
