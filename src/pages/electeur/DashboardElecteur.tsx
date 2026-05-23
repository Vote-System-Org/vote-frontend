import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Vote, LogOut, User, Clock,
  CheckCircle, AlertCircle, BarChart3,
  ShieldCheck, ChevronRight
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
  const [visible, setVisible]                   = useState(false);

  useEffect(() => {
    chargerScrutins();
    setTimeout(() => setVisible(true), 100);
  }, []);

  const chargerScrutins = async () => {
    try {
      const [ouverts, clotures] = await Promise.all([
        api.get('/electeur/scrutins/'),
        api.get('/electeur/scrutins/clotures/'),
      ]);
      setScrutinsOuverts(ouverts.data.results || ouverts.data);
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-lg">VoteSystem</span>
        </div>
        <div className="flex items-center gap-2 md:gap-5">
          {/* Infos utilisateur — masquées sur mobile */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <User size={14} />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm">{user?.prenom} {user?.nom}</p>
              <p className="text-blue-300 text-xs">{user?.filiere} — {user?.niveau}</p>
            </div>
          </div>
          <Link to="/espace/profil"
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg">
            <User size={15} />
            <span className="hidden sm:block">Mon profil</span>
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-red-300 transition-colors">
            <LogOut size={16} />
            <span className="hidden sm:block">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />{error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`space-y-10 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>

            {/* Scrutins ouverts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-blue-900">
                    Mes scrutins disponibles
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Scrutins ouverts pour lesquels vous êtes éligible
                  </p>
                </div>
                {scrutinsOuverts.length > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    {scrutinsOuverts.length} ouvert{scrutinsOuverts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {scrutinsOuverts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-600 font-semibold mb-1">
                    Aucun scrutin disponible
                  </p>
                  <p className="text-gray-400 text-sm">
                    Revenez plus tard ou contactez l'administration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scrutinsOuverts.map((scrutin, i) => (
                    <div key={scrutin.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                      style={{ animationDelay: `${i * 100}ms` }}>

                      {/* Barre verte en haut */}
                      <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />

                      <div className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                EN COURS
                              </span>
                              {scrutin.filiere_cible && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                  {scrutin.filiere_cible}
                                </span>
                              )}
                              {scrutin.niveau_cible && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                  {scrutin.niveau_cible}
                                </span>
                              )}
                            </div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">
                              {scrutin.titre}
                            </h2>
                            {scrutin.description && (
                              <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                {scrutin.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                              <Clock size={13} />
                              <span>Clôture le {formatDate(scrutin.date_fin)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/espace/scrutin/${scrutin.id}`)}
                            className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow group w-full sm:w-auto"
                          >
                            <Vote size={16} />
                            Voter
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scrutins clôturés */}
            {scrutinsClotures.length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-700">
                    Résultats disponibles
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Scrutins clôturés — résultats publiés
                  </p>
                </div>
                <div className="space-y-4">
                  {scrutinsClotures.map((scrutin) => (
                    <div key={scrutin.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">

                      {/* Barre grise */}
                      <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400" />

                      <div className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                CLÔTURÉ
                              </span>
                              {scrutin.filiere_cible && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                  {scrutin.filiere_cible}
                                </span>
                              )}
                            </div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">
                              {scrutin.titre}
                            </h2>
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                              <Clock size={13} />
                              <span>Clôturé le {formatDate(scrutin.date_fin)}</span>
                            </div>
                          </div>
                          <Link
                            to={`/espace/scrutin/${scrutin.id}/resultats`}
                            className="flex items-center justify-center gap-2 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm group w-full sm:w-auto"
                          >
                            <BarChart3 size={16} />
                            Voir résultats
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
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