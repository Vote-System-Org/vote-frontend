import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Upload, Users, Vote,
  ShieldCheck, AlertCircle, CheckCircle
} from 'lucide-react';
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
  const [entries, setEntries]       = useState<ListeBlancheEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [stats, setStats]           = useState<ImportStats | null>(null);
  const [fichier, setFichier]       = useState<File | null>(null);
  const [importing, setImporting]   = useState(false);

  useEffect(() => {
    chargerListe();
  }, []);

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
    setError('');
    setSuccess('');
    setStats(null);

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
      setError(error.response?.data?.message || 'Erreur lors de l\'import.');
    } finally {
      setImporting(false);
    }
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white text-sm font-medium">
              <FileText size={18} />
              Liste blanche
            </Link>
            <Link to="/admin/audit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <ShieldCheck size={18} />
              Logs d'audit
            </Link>
          </nav>
        </aside>

        {/* Contenu */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-900">Liste blanche</h1>
            <p className="text-gray-500 text-sm mt-1">
              Importer et gérer le référentiel officiel des étudiants
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Stats import */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{stats.importes}</p>
                <p className="text-green-600 text-sm">Importés</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{stats.doublons}</p>
                <p className="text-amber-600 text-sm">Doublons ignorés</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{stats.erreurs}</p>
                <p className="text-red-600 text-sm">Erreurs</p>
              </div>
            </div>
          )}

          {/* Formulaire import */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-2">Importer un CSV</h2>
            <p className="text-gray-500 text-sm mb-4">
              Format attendu : matricule, nom, prenom, email, filiere, niveau
            </p>
            <form onSubmit={handleImport} className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFichier(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={!fichier || importing}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <Upload size={16} />
                {importing ? 'Import...' : 'Importer'}
              </button>
            </form>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  {entries.length} entrée(s) dans le référentiel
                </p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Matricule</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nom complet</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Filière</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Compte créé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-gray-700">
                        {entry.matricule}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-800">
                        {entry.prenom} {entry.nom}
                      </td>
                      <td className="px-6 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {entry.filiere} — {entry.niveau}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {entry.a_cree_son_compte
                          ? <CheckCircle size={16} className="text-green-500" />
                          : <AlertCircle size={16} className="text-gray-300" />
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
          )}
        </main>
      </div>
    </div>
  );
}