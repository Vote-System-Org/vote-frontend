import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';

// ── Pages publiques ───────────────────────────────────────────────────────
import PageAccueil        from './pages/public/PageAccueil';
import PageConnexion      from './pages/auth/PageConnexion';
import PageInscription    from './pages/auth/PageInscription';
import ResultatsPublic    from './pages/public/ResultatsPublic';
import PageResetPassword   from './pages/auth/PageResetPassword';
import PageConfirmPassword from './pages/auth/PageConfirmPassword';

// ── Pages électeur ────────────────────────────────────────────────────────
import DashboardElecteur  from './pages/electeur/DashboardElecteur';
import PageVote           from './pages/electeur/PageVote';
import PageConfirmation   from './pages/electeur/PageConfirmation';
import PageRecu           from './pages/electeur/PageRecu';
import MonProfil from './pages/electeur/MonProfil';
import ResultatsPostCloture from './pages/electeur/ResultatsPostCloture';



// ── Pages admin ───────────────────────────────────────────────────────────
import DashboardAdmin     from './pages/admin/DashboardAdmin';
import GestionScrutins    from './pages/admin/GestionScrutins';
import GestionElecteurs   from './pages/admin/GestionElecteurs';
import GestionListeBlanche from './pages/admin/GestionListeBlanche';
import LogsAudit          from './pages/admin/LogsAudit';
import GestionCandidats from './pages/admin/GestionCandidats';
import ResultatsScrutin from './pages/admin/ResultatsScrutin';

// ── Guards ────────────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" />;
  if (isAdmin) return <Navigate to="/admin" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/espace/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Publiques ─────────────────────────────────────────────────── */}
      <Route path="/"                          element={<PageAccueil />} />
      <Route path="/connexion"                 element={<PageConnexion />} />
      <Route path="/inscription"               element={<PageInscription />} />
      <Route path="/resultats/:id"             element={<ResultatsPublic />} />
      <Route path="/mot-de-passe/reset"    element={<PageResetPassword />} />
      <Route path="/mot-de-passe/confirmer" element={<PageConfirmPassword />} />

      {/* ── Électeur ──────────────────────────────────────────────────── */}
      <Route path="/espace/dashboard" element={
        <PrivateRoute><DashboardElecteur /></PrivateRoute>
      }/>
      <Route path="/espace/scrutin/:id" element={
        <PrivateRoute><PageVote /></PrivateRoute>
      }/>
      <Route path="/espace/scrutin/:id/confirmer" element={
        <PrivateRoute><PageConfirmation /></PrivateRoute>
      }/>
      <Route path="/espace/vote/recu" element={
        <PrivateRoute><PageRecu /></PrivateRoute>
      }/>
      <Route path="/espace/profil" element={
        <PrivateRoute><MonProfil /></PrivateRoute>
      }/>
      <Route path="/espace/scrutin/:id/resultats" element={
        <PrivateRoute><ResultatsPostCloture /></PrivateRoute>
      }/>
      {/* ── Admin ─────────────────────────────────────────────────────── */}
      <Route path="/admin" element={
        <AdminRoute><DashboardAdmin /></AdminRoute>
      }/>
      <Route path="/admin/scrutins" element={
        <AdminRoute><GestionScrutins /></AdminRoute>
      }/>
      <Route path="/admin/electeurs" element={
        <AdminRoute><GestionElecteurs /></AdminRoute>
      }/>
      <Route path="/admin/liste-blanche" element={
        <AdminRoute><GestionListeBlanche /></AdminRoute>
      }/>
      <Route path="/admin/audit" element={
        <AdminRoute><LogsAudit /></AdminRoute>
      }/>
      <Route path="/admin/scrutins/:scrutinId/candidats" element={
        <AdminRoute><GestionCandidats /></AdminRoute>
      }/>
      <Route path="/admin/scrutins/:scrutinId/resultats" element={
        <AdminRoute><ResultatsScrutin /></AdminRoute>
      }/>

      {/* ── Fallback ──────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;