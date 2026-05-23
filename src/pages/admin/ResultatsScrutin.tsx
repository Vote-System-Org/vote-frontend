import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle, Download,
  ArrowLeft, Vote, FileText, ShieldCheck,
  Clock, LayoutDashboard, LogOut, AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { Resultats } from '../../types';

export default function ResultatsScrutin() {
  const { scrutinId }   = useParams();
  const { logout }      = useAuth();
  const navigate        = useNavigate();

  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate]   = useState(new Date());

  useEffect(() => {
    chargerResultats();
    const interval = setInterval(() => {
      chargerResultats();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [scrutinId]);

  const chargerResultats = async () => {
    try {
      const response = await api.get(`/admin/scrutins/${scrutinId}/resultats/`);
      setResultats(response.data.data);
    } catch {
      setError('Erreur lors du chargement des résultats.');
    } finally {
      setLoading(false);
    }
  };

  const exporterCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get(
        `/admin/scrutins/${scrutinId}/resultats/export/`,
        { responseType: 'blob' }
      );
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `resultats_scrutin_${scrutinId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Erreur lors de l'export CSV.");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins', active: true },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs' },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche' },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
  ];

  const candidatsReels = resultats?.resultats.filter(r => !r.est_vote_blanc) || [];
  const voteBlanc      = resultats?.resultats.find(r => r.est_vote_blanc);
  const maxVoix        = Math.max(...candidatsReels.map(c => c.nb_voix), 1);

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
          <span className="font-bold text-blue-900">Résultats</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin/scrutins"
                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-blue-900">
                  Résultats en temps réel
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock size={11} />
                    Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { chargerResultats(); setLastUpdate(new Date()); }}
                className="flex items-center gap-2 border border-gray-300 text-gray-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <RefreshCw size={15} />
                <span className="hidden sm:block">Actualiser</span>
              </button>
              <button onClick={exporterCSV} disabled={exporting}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Download size={15} />
                {exporting ? 'Export...' : 'Exporter CSV'}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : resultats ? (
            <div className="space-y-5">

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Éligibles', value: resultats.nb_eligibles, icon: <Users size={18} />, color: 'text-blue-900', bg: 'bg-blue-50' },
                  { label: 'Votants', value: resultats.nb_votants, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Abstentions', value: resultats.nb_abstentions, icon: <Users size={18} />, color: 'text-gray-400', bg: 'bg-gray-50' },
                  { label: 'Participation', value: `${resultats.taux_participation}%`, icon: <BarChart3 size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                      <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                    </div>
                    <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Résultats candidats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h2 className="font-bold text-gray-800 mb-6 text-lg">
                  Résultats par candidat
                </h2>
                <div className="space-y-5">
                  {candidatsReels
                    .sort((a, b) => b.nb_voix - a.nb_voix)
                    .map((candidat, index) => (
                      <div key={candidat.candidat_id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {index === 0 && candidat.nb_voix > 0 && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                1er
                              </span>
                            )}
                            <span className="font-semibold text-gray-800 text-sm truncate">
                              {candidat.nom} {candidat.prenom || ''}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <span className="font-bold text-blue-900 text-sm">{candidat.nb_voix} voix</span>
                            <span className="text-gray-400 text-xs ml-1">({candidat.pourcentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-700 ${
                              index === 0 ? 'bg-blue-900' : 'bg-blue-400'
                            }`}
                            style={{ width: `${maxVoix > 0 ? (candidat.nb_voix / maxVoix) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))
                  }
                </div>

                {/* Vote blanc */}
                {voteBlanc && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm font-medium">Vote blanc</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-500 text-sm">{voteBlanc.nb_voix} voix</span>
                        <span className="text-gray-400 text-xs ml-1">({voteBlanc.pourcentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full"
                        style={{ width: `${voteBlanc.pourcentage}%` }} />
                    </div>
                  </div>
                )}

                {/* Abstentions */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm text-gray-400">
                  <span>Abstentions</span>
                  <span className="font-medium">{resultats.nb_abstentions}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <BarChart3 className="mx-auto text-gray-200 mb-3" size={40} />
              <p className="text-gray-400">Aucun résultat disponible.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}