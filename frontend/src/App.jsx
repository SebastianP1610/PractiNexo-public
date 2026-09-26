import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import CrearOferta from "./pages/CrearOferta";
import GestionarOfertas from "./pages/GestionarOfertas";
import MaestrasAdmin from "./pages/MaestrasAdmin";
import GestionarProgramas from "./pages/GestionarProgramas";
import GestionarEstudiantes from "./pages/GestionarEstudiantes";
import ReporteOfertas from "./pages/ReporteOfertas";
import ReportePostulaciones from "./pages/ReportePostulaciones";
import AdminDashboard from "./pages/AdminDashboard";
import PostulacionesAdmin from "./pages/PostulacionesAdmin";
import InicioEstudiante from "./pages/InicioEstudiante";
import OfertasEstudiante from "./pages/OfertasEstudiante";
import DetalleOferta from "./pages/DetalleOferta";
import MatchingEstudiante from "./pages/MatchingEstudiante";
import MisPostulaciones from "./pages/MisPostulaciones";
import PerfilEstudiante from "./pages/PerfilEstudiante";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 4000, style: { fontSize: "14px" } }}
      />
      <Routes>
        <Route path="/" element={<InicioEstudiante />} />
        <Route path="/inicio-estudiante" element={<InicioEstudiante />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ofertas" element={<OfertasEstudiante />} />
        <Route path="/ofertas/:id" element={<DetalleOferta />} />
        <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
        <Route path="/sugerencias" element={<MatchingEstudiante />} />
        <Route path="/perfil" element={<PerfilEstudiante />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="maestras" element={<MaestrasAdmin />} />
          <Route path="programas" element={<GestionarProgramas />} />
          <Route path="estudiantes" element={<GestionarEstudiantes />} />
          <Route path="reporte-ofertas" element={<ReporteOfertas />} />
          <Route path="reporte-postulaciones" element={<ReportePostulaciones />} />
          <Route path="ofertas" element={<GestionarOfertas />} />
          <Route path="crear-oferta" element={<CrearOferta />} />
          <Route path="postulaciones" element={<PostulacionesAdmin />} />
        </Route>
        <Route path="/maestras" element={<Navigate to="/admin/maestras" replace />} />
        <Route path="/crear-oferta" element={<Navigate to="/admin/crear-oferta" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
