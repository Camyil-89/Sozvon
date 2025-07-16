import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/main/main.page';
import LoginPage from './pages/auth/login.page';
import RegisterPage from './pages/auth/register.page';
import AccessDeniedPage from './pages/access-denied/access-denied.page';
import ProtectedRoute from './hooks/ProviderRoute';
import { AuthProvider } from './hooks/useAuth';
import AdminPanelPage from './pages/admin-panel/admin-panel.page';
import ProfilePage from './pages/profile/profile.page';
import RoomPage from './pages/room/room.page';
import RoomManagerPage from './pages/room/room-manager.page';
import FriendPage from './pages/friends/friends.page';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friend" element={<FriendPage />} />
          <Route path="/room" element={<RoomManagerPage />} />
          <Route path="/room/:id" element={<RoomPage />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={['admin']} unauthorizedRedirectPath="/access-denied" />}
        >
          <Route path="/admin/users" element={<AdminPanelPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;