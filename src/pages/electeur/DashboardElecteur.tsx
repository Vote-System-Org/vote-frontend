import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Vote, LogOut, User, Clock,
  CheckCircle, AlertCircle, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { Scrutin } from '../../types';

export default function DashboardElecteur() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [scrutinsOuverts, setScrutinsOuverts]   = useState<Scrutin[]>([]);
  const [scrutinsClotures, setScrutinsClotures] = useState<Scrutin[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState('');

  useEffect(() => {
    chargerScrutins();
  }, []);

  const chargerScrutins = async () => {
    try {
      const response = await api.get('/electeur/scrutins/');
      setScrutinsOuverts(response.data.results || response.data);

      // Charger aussi les scrutins clôturés
      const clotures = await api.get('/electeur/scrutins/clotures/');
      setScrutinsClotures(clotures.data.results || clotures.data);
    } catch {
      setError('Erreur lors du chargement des scrutins.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Vote size={24} />
          <span className="font-bold text-lg">VoteSystem</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <User size={16} />
            <span>{user?.prenom} {user?.nom}</span>
            <span className="bg-blue-700 px-2 py-0.5 rounded text-xs">
              {user?.filiere} — {user?.niveau}
            </span>
          </div>
          <Link
            to="/espace/profil"
            className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <User size={16} />
            Mon profil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Chargement...
          </div>
        ) : (
          <div className="space-y-10">

            {/* Scrutins ouverts */}
            <div>
              <h1 className="text-2xl font-bold text-blue-900 mb-2">
                Mes scrutins disponibles
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Scrutins ouverts pour lesquels vous êtes éligible
              </p>

              {scrutinsOuverts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">
                    Aucun scrutin disponible pour le moment.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Revenez plus tard ou contactez l'administration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scrutinsOuverts.map((scrutin) => (
                    <div
                      key={scrutin.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              OUVERT
                            </span>
                            {scrutin.filiere_cible && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                {scrutin.filiere_cible}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-bold text-gray-800 mb-1">
                            {scrutin.titre}
                          </h2>
                          {scrutin.description && (
                            <p className="text-gray-500 text-sm mb-3">
                              {scrutin.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock size={14} />
                            <span>Clôture le {formatDate(scrutin.date_fin)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/espace/scrutin/${scrutin.id}`)}
                          className="ml-6 flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                        >
                          <Vote size={16} />
                          Voter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scrutins clôturés */}
            {scrutinsClotures.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  Résultats disponibles
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Scrutins clôturés — résultats publiés
                </p>
                <div className="space-y-4">
                  {scrutinsClotures.map((scrutin) => (
                    <div
                      key={scrutin.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                              CLÔTURÉ
                            </span>
                            {scrutin.filiere_cible && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                {scrutin.filiere_cible}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-bold text-gray-800 mb-1">
                            {scrutin.titre}
                          </h2>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock size={14} />
                            <span>Clôturé le {formatDate(scrutin.date_fin)}</span>
                          </div>
                        </div>
                        <Link
                          to={`/espace/scrutin/${scrutin.id}/resultats`}
                          className="ml-6 flex items-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                        >
                          <BarChart3 size={16} />
                          Voir résultats
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}