import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import { AdminLayout } from './components/admin/AdminLayout'
import { TechnicianLayout } from './components/technician/TechnicianLayout'
import { PageWrapper } from './lib/pageWrapper'
import DashboardPage from './pages/admin/Dashboard'
import LogsPage from './pages/admin/Logs'
import TechniciansPage from './pages/admin/Technicians'
import TasksPage from './pages/admin/Tasks'
import RequirementsPage from './pages/admin/Requirements'
import MaterialsPage from './pages/admin/Materials'
import AnalyticsPage from './pages/admin/Analytics'
import WhatsAppPage from './pages/admin/WhatsApp'
import SettingsPage from './pages/admin/Settings'
import ProfilePage from './pages/admin/Profile'
import MonitoringPage from './pages/admin/Monitoring'
import TechnicianDashboard from './pages/technician/Dashboard'
import TechnicianTasksPage from './pages/technician/Tasks'
import TechnicianLocationPage from './pages/technician/Location'
import TechnicianMaterialsPage from './pages/technician/Materials'
import TechnicianMessagesPage from './pages/technician/Messages'
import TechnicianProfilePage from './pages/technician/Profile'
import TechnicianSettingsPage from './pages/technician/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PageWrapper page="login"><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper page="register"><RegisterPage /></PageWrapper>} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageWrapper page="admin-dashboard"><DashboardPage /></PageWrapper>} />
          <Route path="logs" element={<PageWrapper page="admin-logs"><LogsPage /></PageWrapper>} />
          <Route path="technicians" element={<PageWrapper page="admin-technicians"><TechniciansPage /></PageWrapper>} />
          <Route path="tasks" element={<PageWrapper page="admin-tasks"><TasksPage /></PageWrapper>} />
          <Route path="requirements" element={<PageWrapper page="admin-requirements"><RequirementsPage /></PageWrapper>} />
          <Route path="materials" element={<PageWrapper page="admin-materials"><MaterialsPage /></PageWrapper>} />
          <Route path="monitoring" element={<PageWrapper page="admin-monitoring"><MonitoringPage /></PageWrapper>} />
          <Route path="analytics" element={<PageWrapper page="admin-analytics"><AnalyticsPage /></PageWrapper>} />
          <Route path="whatsapp" element={<PageWrapper page="admin-whatsapp"><WhatsAppPage /></PageWrapper>} />
          <Route path="feedback" element={<PageWrapper page="admin-requirements"><RequirementsPage /></PageWrapper>} />
          <Route path="calendar" element={<PageWrapper page="admin-dashboard"><DashboardPage /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper page="admin-settings"><SettingsPage /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper page="admin-profile"><ProfilePage /></PageWrapper>} />
        </Route>
        
        <Route
          path="/technician"
          element={
            <ProtectedRoute>
              <TechnicianLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageWrapper page="technician-dashboard"><TechnicianDashboard /></PageWrapper>} />
          <Route path="tasks" element={<PageWrapper page="technician-tasks"><TechnicianTasksPage /></PageWrapper>} />
          <Route path="location" element={<PageWrapper page="technician-location"><TechnicianLocationPage /></PageWrapper>} />
          <Route path="materials" element={<PageWrapper page="technician-materials"><TechnicianMaterialsPage /></PageWrapper>} />
          <Route path="messages" element={<PageWrapper page="technician-messages"><TechnicianMessagesPage /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper page="technician-profile"><TechnicianProfilePage /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper page="technician-settings"><TechnicianSettingsPage /></PageWrapper>} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
