import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SuperadminDashboard from './pages/dashboards/Superadmin';
import ProfesorDashboard from './pages/dashboards/Profesor';
import EstudianteDashboard from './pages/dashboards/Estudiante';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (user.rol !== allowedRole) return <Navigate to={`/${user.rol}`} />;
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRole="superadmin">
              <SuperadminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profesor" element={
            <ProtectedRoute allowedRole="profesor">
              <ProfesorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiante" element={
            <ProtectedRoute allowedRole="estudiante">
              <EstudianteDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
