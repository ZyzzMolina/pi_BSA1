import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AlumnosPage from './pages/admin/AlumnosPage';
import DocentesPage from './pages/admin/DocentesPage';
import MateriasPage from './pages/admin/MateriasPage';
import GruposPage from './pages/admin/GruposPage';
import InscripcionesPage from './pages/admin/InscripcionesPage';
import CalificacionesPage from './pages/admin/CalificacionesPage';
import ConsultasPage from './pages/admin/ConsultasPage';
import PeriodosDocentePage from './pages/admin/PeriodosDocentePage';
import DocenteDashboard from './pages/docente/DocenteDashboard';
import AlumnoDashboard from './pages/alumno/AlumnoDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="alumnos" element={<AlumnosPage />} />
            <Route path="docentes" element={<DocentesPage />} />
            <Route path="materias" element={<MateriasPage />} />
            <Route path="grupos" element={<GruposPage />} />
            <Route path="inscripciones" element={<InscripcionesPage />} />
            <Route path="calificaciones" element={<CalificacionesPage />} />
            <Route path="periodos-docentes" element={<PeriodosDocentePage />} />
            <Route path="consultas" element={<ConsultasPage />} />
          </Route>

          {/* Docente Routes */}
          <Route path="/docente" element={
            <ProtectedRoute roles={['docente']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DocenteDashboard />} />
            <Route path="grupos" element={<DocenteDashboard />} />
            <Route path="calificaciones" element={<DocenteDashboard />} />
          </Route>

          {/* Alumno Routes */}
          <Route path="/alumno" element={
            <ProtectedRoute roles={['alumno']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AlumnoDashboard />} />
            <Route path="historial" element={<AlumnoDashboard />} />
            <Route path="promedios" element={<AlumnoDashboard />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

//ff
export default App;
