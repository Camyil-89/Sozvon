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
import Calls from './components/gateway/calls';
import MainBackground from './components/mainBackground';

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
      <Calls></Calls>
      <Routes>
        <Route path="/" element={<MainBackground><MainPage /></MainBackground>} />
        <Route path="/login" element={<MainBackground><LoginPage /></MainBackground>} />
        <Route path="/register" element={<MainBackground><RegisterPage /></MainBackground>} />
        <Route path="/access-denied" element={<MainBackground><AccessDeniedPage /></MainBackground>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<MainBackground><ProfilePage /></MainBackground>} />
          <Route path="/friend" element={<MainBackground><FriendPage /></MainBackground>} />
          <Route path="/room" element={<MainBackground><RoomManagerPage /></MainBackground>} />
          <Route path="/room/:id" element={<MainBackground><RoomPage /></MainBackground>} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={['admin']} unauthorizedRedirectPath="/access-denied" />}
        >
          <Route path="/admin/users" element={<MainBackground><AdminPanelPage /></MainBackground>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;