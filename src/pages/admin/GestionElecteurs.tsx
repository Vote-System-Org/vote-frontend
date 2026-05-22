import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, CheckCircle, XCircle,
  Vote, FileText, ShieldCheck, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import type { Electeur } from '../../types';

export default function GestionElecteurs() {
  const [electeurs, setElecteurs]   = useState<Electeur[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  useEffect(() => {
    chargerElecteurs();
  }, [filtreStatut]);

  const chargerElecteurs = async () => {
    try {
      const params = new URLSearchParams();
      if (filtreStatut) params.append('statut', filtreStatut);
      if (search)       params.append('search', search);

      const response = await api.get(`/admin/electeurs/?${params}`);
      setElecteurs(response.data.results || response.data);
    } catch {
      setError('Erreur lors du chargement des électeurs.');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (id: number, statut: string) => {
    try {
      await api.patch(`/admin/electeurs/${id}/statut/`, { statut });
      chargerElecteurs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur changement statut.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    chargerElecteurs();
  };

  const badgeStatut = (statut: string) => {
    switch (statut) {
      case 'ELIGIBLE':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">ELIGIBLE</span>;
      case 'SUSPENDU':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">SUSPENDU</span>;
      default:
        return <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EN ATTENTE</span>;
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white text-sm font-medium">
              <Users size={18} />
              Électeurs
            </Link>
            <Link to="/admin/liste-blanche"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
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
            <h1 className="text-2xl font-bold text-blue-900">Électeurs</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gérer les comptes électeurs
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par matricule, nom..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
                >
                  Rechercher
                </button>
              </form>

              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="ELIGIBLE">Éligible</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Électeur
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Filière / Niveau
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      A voté
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {electeurs.map((electeur) => (
                    <tr key={electeur.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 text-sm">
                          {electeur.prenom} {electeur.nom}
                        </p>
                        <p className="text-gray-400 text-xs">{electeur.matricule}</p>
                        <p className="text-gray-400 text-xs">{electeur.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {electeur.filiere} — {electeur.niveau}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {badgeStatut(electeur.statut)}
                      </td>
                      <td className="px-6 py-4">
                        {electeur.a_vote
                          ? <CheckCircle size={18} className="text-green-500" />
                          : <XCircle size={18} className="text-gray-300" />
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {electeur.statut !== 'SUSPENDU' ? (
                            <button
                              onClick={() => changerStatut(electeur.id, 'SUSPENDU')}
                              className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              onClick={() => changerStatut(electeur.id, 'ELIGIBLE')}
                              className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {electeurs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        Aucun électeur trouvé.
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