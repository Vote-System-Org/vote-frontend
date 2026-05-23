import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Vote, Users, FileText,
  AlertCircle, CheckCircle, RefreshCw,
  LayoutDashboard, LogOut, Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { LogAudit } from '../../types';

export default function LogsAudit() {
  const { logout }   = useAuth();
  const navigate     = useNavigate();

  const [logs, setLogs]                 = useState<LogAudit[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [integrite, setIntegrite]       = useState<boolean | null>(null);
  const [filtreAction, setFiltreAction] = useState('');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [verifLoading, setVerifLoading] = useState(false);

  useEffect(() => { chargerLogs(); }, [filtreAction]);

  const chargerLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filtreAction) params.append('action', filtreAction);
      const response = await api.get(`/admin/audit/logs/?${params}`);
      setLogs(response.data.results || response.data);
    } catch {
      setError('Erreur lors du chargement des logs.');
    } finally {
      setLoading(false);
    }
  };

  const verifierIntegrite = async () => {
    setVerifLoading(true);
    try {
      const response = await api.get('/admin/audit/integrite/');
      setIntegrite(response.data.integre);
    } catch {
      setError('Erreur lors de la vérification.');
    } finally {
      setVerifLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins' },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs' },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche' },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit", active: true },
  ];

  const badgeAction = (action: string) => {
    const colors: Record<string, string> = {
      CONNEXION:            'bg-blue-100 text-blue-700',
      INSCRIPTION:          'bg-green-100 text-green-700',
      VOTE:                 'bg-purple-100 text-purple-700',
      CREATION_SCRUTIN:     'bg-amber-100 text-amber-700',
      OUVERTURE_SCRUTIN:    'bg-teal-100 text-teal-700',
      CLOTURE_SCRUTIN:      'bg-gray-100 text-gray-700',
      SUSPENSION_ELECTEUR:  'bg-red-100 text-red-700',
      VALIDATION_ELECTEUR:  'bg-green-100 text-green-700',
      IMPORT_LISTE_BLANCHE: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[action] || 'bg-gray-100 text-gray-700'}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

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
          <span className="font-bold text-blue-900">Logs d'audit</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Logs d'audit</h1>
              <p className="text-gray-500 text-sm mt-1">
                Journalisation chaînée SHA-256 — immuable
              </p>
            </div>
            <button onClick={verifierIntegrite} disabled={verifLoading}
              className="flex items-center gap-2 border border-blue-900 text-blue-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm disabled:opacity-50">
              <RefreshCw size={16} className={verifLoading ? 'animate-spin' : ''} />
              Vérifier l'intégrité
            </button>
          </div>

          {/* Intégrité */}
          {integrite !== null && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm ${
              integrite
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'
            }`}>
              {integrite
                ? <><CheckCircle size={16} /> Chaîne d'audit intègre — aucune altération détectée.</>
                : <><AlertCircle size={16} /> Rupture de chaîne détectée — des logs ont été altérés !</>
              }
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total logs', value: logs.length, color: 'text-blue-900' },
              { label: 'Votes', value: logs.filter(l => l.action === 'VOTE').length, color: 'text-purple-600' },
              { label: 'Connexions', value: logs.filter(l => l.action === 'CONNEXION').length, color: 'text-blue-500' },
              { label: 'Inscriptions', value: logs.filter(l => l.action === 'INSCRIPTION').length, color: 'text-green-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filtre */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <select value={filtreAction}
              onChange={(e) => setFiltreAction(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
              <option value="">Toutes les actions</option>
              <option value="CONNEXION">Connexion</option>
              <option value="INSCRIPTION">Inscription</option>
              <option value="VOTE">Vote</option>
              <option value="CREATION_SCRUTIN">Création scrutin</option>
              <option value="OUVERTURE_SCRUTIN">Ouverture scrutin</option>
              <option value="CLOTURE_SCRUTIN">Clôture scrutin</option>
              <option value="SUSPENSION_ELECTEUR">Suspension électeur</option>
              <option value="IMPORT_LISTE_BLANCHE">Import liste blanche</option>
            </select>
          </div>

          {/* Logs */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
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
                {logs.map((log) => (
                  <div key={log.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      {badgeAction(log.action)}
                      <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{log.acteur_nom || 'Système'}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Hash size={12} className="text-gray-300" />
                      <span className="font-mono text-xs text-gray-400">
                        {log.hash_courant.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vue desktop — tableau */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Action', 'Acteur', 'Date', 'Hash'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">{badgeAction(log.action)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {log.acteur_nom || 'Système'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Hash size={12} className="text-gray-300" />
                            <span className="font-mono text-xs text-gray-400">
                              {log.hash_courant.substring(0, 16)}...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          Aucun log disponible.
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