import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Vote, FileText,
  LogOut, ShieldCheck, TrendingUp, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { Scrutin } from '../../types';

export default function DashboardAdmin() {
  const { logout }   = useAuth();
  const navigate     = useNavigate();

  const [scrutins, setScrutins]         = useState<Scrutin[]>([]);
  const [nbElecteurs, setNbElecteurs]   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [scrutinsRes, electeursRes] = await Promise.all([
        api.get('/admin/scrutins/'),
        api.get('/admin/electeurs/'),
      ]);
      setScrutins(scrutinsRes.data.results || scrutinsRes.data);
      setNbElecteurs(electeursRes.data.count || electeursRes.data.length);
    } catch {
      console.error('Erreur chargement données admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const scrutinsOuverts  = scrutins.filter(s => s.statut === 'OUVERT').length;
  const scrutinsBrouillon = scrutins.filter(s => s.statut === 'BROUILLON').length;
  const scrutinsClotures = scrutins.filter(s => s.statut === 'CLOTURE').length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sidebar + Contenu */}
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white text-sm font-medium">
              <LayoutDashboard size={18} />
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors">
              <ShieldCheck size={18} />
              Logs d'audit
            </Link>
          </nav>

          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white text-sm transition-colors w-full"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-900">
              Tableau de bord
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Vue synthétique de la plateforme
            </p>
          </div>

          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm">Électeurs</p>
                    <Users className="text-blue-900" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{nbElecteurs}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm">Scrutins ouverts</p>
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{scrutinsOuverts}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm">En préparation</p>
                    <Clock className="text-amber-500" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-amber-500">{scrutinsBrouillon}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm">Clôturés</p>
                    <ShieldCheck className="text-gray-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-gray-400">{scrutinsClotures}</p>
                </div>
              </div>

              {/* Scrutins récents */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Scrutins récents</h2>
                  <Link
                    to="/admin/scrutins"
                    className="text-blue-900 text-sm font-medium hover:underline"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {scrutins.slice(0, 5).map((scrutin) => (
                    <div key={scrutin.id} className="p-6 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{scrutin.titre}</p>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {scrutin.nb_eligibles} électeurs éligibles
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        scrutin.statut === 'OUVERT'
                          ? 'bg-green-100 text-green-700'
                          : scrutin.statut === 'BROUILLON'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {scrutin.statut}
                      </span>
                    </div>
                  ))}
                  {scrutins.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                      Aucun scrutin créé pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}