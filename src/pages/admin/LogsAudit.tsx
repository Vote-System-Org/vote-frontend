import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Vote, Users, FileText,
  AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import api from '../../api/axios';
import type { LogAudit } from '../../types';

export default function LogsAudit() {
  const [logs, setLogs]             = useState<LogAudit[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [integrite, setIntegrite]   = useState<boolean | null>(null);
  const [filtreAction, setFiltreAction] = useState('');

  useEffect(() => {
    chargerLogs();
  }, [filtreAction]);

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
    try {
      const response = await api.get('/admin/audit/integrite/');
      setIntegrite(response.data.integre);
    } catch {
      setError('Erreur lors de la vérification.');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

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
        {action}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
          <div className="p-6 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} />
              <span className="font-bold text-lg">VoteSystem</span>
            </div>
            <p className="text-blue-300 text-xs mt-1">Administration</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              Tableau de bord
            </Link>
            <Link to="/admin/scrutins"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <Vote size={18} />
              Scrutins
            </Link>
            <Link to="/admin/electeurs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <Users size={18} />
              Électeurs
            </Link>
            <Link to="/admin/liste-blanche"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <FileText size={18} />
              Liste blanche
            </Link>
            <Link to="/admin/audit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white text-sm font-medium">
              <ShieldCheck size={18} />
              Logs d'audit
            </Link>
          </nav>
        </aside>

        {/* Contenu */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Logs d'audit</h1>
              <p className="text-gray-500 text-sm mt-1">
                Journalisation chaînée SHA-256 — immuable
              </p>
            </div>
            <button
              onClick={verifierIntegrite}
              className="flex items-center gap-2 border border-blue-900 text-blue-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              <RefreshCw size={16} />
              Vérifier l'intégrité
            </button>
          </div>

          {/* Intégrité */}
          {integrite !== null && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm ${
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
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Filtre */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <select
              value={filtreAction}
              onChange={(e) => setFiltreAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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

          {/* Table */}
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acteur</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {badgeAction(log.action)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {log.acteur_nom || 'Système'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-400">
                          {log.hash_courant.substring(0, 16)}...
                        </span>
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
          )}
        </main>
      </div>
    </div>
  );
}