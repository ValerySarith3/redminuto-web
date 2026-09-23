import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute, RutaPublica } from "./components/ProtectedRoute";
import { ProgramasPage } from "./features/programas/ProgramasPage";
import { VoluntariosPage } from "./features/voluntarios/VoluntariosPage";
import { BeneficiariosPage } from "./features/beneficiarios/BeneficiariosPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { AuthPage } from "./features/auth/AuthPage";
import { AdminPage } from "./features/admin/AdminPage";

function App() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <RutaPublica>
              <ProgramasPage />
            </RutaPublica>
          }
        />
        <Route
          path="/voluntariado"
          element={
            <RutaPublica>
              <VoluntariosPage />
            </RutaPublica>
          }
        />
        <Route
          path="/beneficiarios"
          element={
            <RutaPublica>
              <BeneficiariosPage />
            </RutaPublica>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <RutaPublica>
              <AuthPage />
            </RutaPublica>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolRequerido="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
