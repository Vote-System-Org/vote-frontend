import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Upload, Users, Vote,
  ShieldCheck, AlertCircle, CheckCircle,
  LayoutDashboard, LogOut, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface ListeBlancheEntry {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere: string;
  niveau: string;
  a_cree_son_compte: boolean;
}

interface ImportStats {
  importes: number;
  doublons: number;
  erreurs: number;
  details_erreurs: string[];
}

export default function GestionListeBlanche() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [entries, setEntries]       = useState<ListeBlancheEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [stats, setStats]           = useState<ImportStats | null>(null);
  const [fichier, setFichier]       = useState<File | null>(null);
  const [importing, setImporting]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { chargerListe(); }, []);

  const chargerListe = async () => {
    try {
      const response = await api.get('/admin/liste-blanche/');
      setEntries(response.data.results || response.data);
    } catch {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fichier) return;
    setImporting(true);
    setError(''); setSuccess(''); setStats(null);
    const formData = new FormData();
    formData.append('fichier', fichier);
    try {
      const response = await api.post('/admin/liste-blanche/import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStats(response.data.data);
      setSuccess(response.data.message);
      setFichier(null);
      chargerListe();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de l'import.");
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins' },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs' },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche', active: true },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
  ];

  const nbInscrits  = entries.filter(e => e.a_cree_son_compte).length;
  const nbAttente   = entries.filter(e => !e.a_cree_son_compte).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 min-h-screen bg-blue-900 text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-bold text-lg">VoteSystem</span>
              <p className="text-blue-300 text-xs">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                link.active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white text-sm transition-all w-full">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
            </div>
          </button>
          <span className="font-bold text-blue-900">Liste blanche</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Liste blanche</h1>
            <p className="text-gray-500 text-sm mt-1">
              Importer et gérer le référentiel officiel des étudiants
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
              <CheckCircle size={16} />{success}
            </div>
          )}

          {/* Stats import */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p className="text-2xl font-bold text-green-700">{stats.importes}</p>
                <p className="text-green-600 text-sm mt-1">Importés</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                <p className="text-2xl font-bold text-amber-700">{stats.doublons}</p>
                <p className="text-amber-600 text-sm mt-1">Doublons ignorés</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <p className="text-2xl font-bold text-red-700">{stats.erreurs}</p>
                <p className="text-red-600 text-sm mt-1">Erreurs</p>
              </div>
            </div>
          )}

          {/* Stats globales */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
              <p className="text-gray-500 text-xs mt-1">Total étudiants</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{nbInscrits}</p>
              <p className="text-gray-500 text-xs mt-1">Inscrits</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-bold text-amber-500">{nbAttente}</p>
              <p className="text-gray-500 text-xs mt-1">Non inscrits</p>
            </div>
          </div>

          {/* Formulaire import */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-1">Importer un CSV</h2>
            <p className="text-gray-500 text-sm mb-4">
              Format attendu : <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">matricule, nom, prenom, email, filiere, niveau</span>
            </p>
            <form onSubmit={handleImport} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <input type="file" accept=".csv"
                onChange={(e) => setFichier(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 transition-colors"
              />
              <button type="submit" disabled={!fichier || importing}
                className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Upload size={16} />
                {importing ? 'Import...' : 'Importer'}
              </button>
            </form>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Vue mobile — cartes */}
              <div className="block md:hidden space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {entry.prenom} {entry.nom}
                        </p>
                        <p className="font-mono text-xs text-gray-400">{entry.matricule}</p>
                      </div>
                      {entry.a_cree_son_compte
                        ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        : <XCircle size={18} className="text-gray-300 flex-shrink-0" />
                      }
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {entry.filiere} — {entry.niveau}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vue desktop — tableau */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">
                    {entries.length} entrée(s) dans le référentiel
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Matricule', 'Nom complet', 'Filière', 'Compte créé'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-700">{entry.matricule}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800">
                            {entry.prenom} {entry.nom}
                          </p>
                          <p className="text-xs text-gray-400">{entry.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                            {entry.filiere} — {entry.niveau}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {entry.a_cree_son_compte
                            ? <CheckCircle size={18} className="text-green-500" />
                            : <XCircle size={18} className="text-gray-300" />
                          }
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          Aucune entrée. Importez un fichier CSV.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}