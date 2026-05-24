import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

// ── Pages publiques ───────────────────────────────────────────────────────
import PageAccueil         from './pages/public/PageAccueil';
import PageConnexion       from './pages/auth/PageConnexion';
import PageInscription     from './pages/auth/PageInscription';
import ResultatsPublic     from './pages/public/ResultatsPublic';
import PageResetPassword   from './pages/auth/PageResetPassword';
import PageConfirmPassword from './pages/auth/PageConfirmPassword';
import VerifierVote        from './pages/public/VerifierVote';
import QRCodePlateforme    from './pages/public/QRCodePlateforme';
import Page404             from './pages/public/Page404';

// ── Pages électeur ────────────────────────────────────────────────────────
import DashboardElecteur    from './pages/electeur/DashboardElecteur';
import PageVote             from './pages/electeur/PageVote';
import PageConfirmation     from './pages/electeur/PageConfirmation';
import PageRecu             from './pages/electeur/PageRecu';
import MonProfil            from './pages/electeur/MonProfil';
import ResultatsPostCloture from './pages/electeur/ResultatsPostCloture';

// ── Pages admin ───────────────────────────────────────────────────────────
import DashboardAdmin      from './pages/admin/DashboardAdmin';
import GestionScrutins     from './pages/admin/GestionScrutins';
import GestionElecteurs    from './pages/admin/GestionElecteurs';
import GestionListeBlanche from './pages/admin/GestionListeBlanche';
import LogsAudit           from './pages/admin/LogsAudit';
import GestionCandidats    from './pages/admin/GestionCandidats';
import ResultatsScrutin    from './pages/admin/ResultatsScrutin';
import QRCodes             from './pages/admin/QRCodes';

// ── Barre de progression ──────────────────────────────────────────────────
function ProgressBar() {
  const location              = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => setProgress(100), 300);
    const t3 = setTimeout(() => setVisible(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Guards ────────────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
  return isAuthenticated ? <>{children}</> : <Navigate to="/connexion" />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
  return isAdmin ? <>{children}</> : <Navigate to="/espace/dashboard" />;
}

// ── Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <ProgressBar />
      <Routes>
        {/* ── Publiques ─────────────────────────────────────────────── */}
        <Route path="/"                       element={<PageAccueil />} />
        <Route path="/connexion"              element={<PageConnexion />} />
        <Route path="/inscription"            element={<PageInscription />} />
        <Route path="/resultats/:id"          element={<ResultatsPublic />} />
        <Route path="/mot-de-passe/reset"     element={<PageResetPassword />} />
        <Route path="/mot-de-passe/confirmer" element={<PageConfirmPassword />} />
        <Route path="/verifier-vote"          element={<VerifierVote />} />
        <Route path="/qrcode"                 element={<QRCodePlateforme />} />

        {/* ── Électeur ──────────────────────────────────────────────── */}
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

        {/* ── Admin ─────────────────────────────────────────────────── */}
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
        <Route path="/admin/qrcodes" element={
          <AdminRoute><QRCodes /></AdminRoute>
        }/>

        {/* ── 404 ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;