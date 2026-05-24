import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Vote, FileText, LogOut,
  ShieldCheck, Clock, BarChart3, ChevronRight,
  Activity, QrCode, RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import api from "../../api/axios";
import type { Scrutin } from "../../types";

export default function DashboardAdmin() {
  const { logout }  = useAuth();
  const navigate    = useNavigate();
  const toast       = useToast();

  const [scrutins, setScrutins]       = useState<Scrutin[]>([]);
  const [nbElecteurs, setNbElecteurs] = useState(0);
  const [nbVotes, setNbVotes]         = useState(0);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate]   = useState(new Date());

  const chargerDonnees = useCallback(async (silent = false) => {
    try {
      const [scrutinsRes, electeursRes] = await Promise.all([
        api.get("/admin/scrutins/"),
        api.get("/admin/electeurs/"),
      ]);
      const scrutinsData = scrutinsRes.data.results || scrutinsRes.data;
      setScrutins(scrutinsData);
      setNbElecteurs(electeursRes.data.count || electeursRes.data.length);

      // Compter votes émis sur scrutins ouverts
      const ouverts = scrutinsData.filter((s: Scrutin) => s.statut === 'OUVERT');
      let totalVotes = 0;
      for (const s of ouverts) {
        const res = await api.get(`/admin/scrutins/${s.id}/resultats/`);
        totalVotes += res.data.data?.nb_votants || 0;
      }
      setNbVotes(totalVotes);
      setLastUpdate(new Date());
      if (silent) toast.success('Données actualisées');
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
    // Actualisation toutes les 30 secondes
    const interval = setInterval(() => chargerDonnees(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/connexion");
  };

  const scrutinsOuverts   = scrutins.filter((s) => s.statut === "OUVERT").length;

  const scrutinsClotures  = scrutins.filter((s) => s.statut === "CLOTURE").length;

  const navLinks = [
    { to: "/admin",               icon: <LayoutDashboard size={18} />, label: "Tableau de bord", active: true },
    { to: "/admin/scrutins",      icon: <Vote size={18} />,            label: "Scrutins" },
    { to: "/admin/electeurs",     icon: <Users size={18} />,           label: "Électeurs" },
    { to: "/admin/liste-blanche", icon: <FileText size={18} />,        label: "Liste blanche" },
    { to: "/admin/audit",         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
    { to: "/admin/qrcodes",       icon: <QrCode size={18} />,          label: "QR Codes" },
  ];

  const stats = [
    {
      label: "Électeurs inscrits",
      value: nbElecteurs,
      icon: <Users size={22} />,
      bg: "bg-blue-50", text: "text-blue-900",
    },
    {
      label: "Scrutins ouverts",
      value: scrutinsOuverts,
      icon: <Activity size={22} />,
      bg: "bg-green-50", text: "text-green-700",
    },
    {
      label: "Votes émis",
      value: nbVotes,
      icon: <Vote size={22} />,
      bg: "bg-purple-50", text: "text-purple-700",
      live: scrutinsOuverts > 0,
    },
    {
      label: "Scrutins clôturés",
      value: scrutinsClotures,
      icon: <BarChart3 size={22} />,
      bg: "bg-gray-50", text: "text-gray-600",
    },
  ];

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
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
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
                  ? "bg-white/15 text-white font-semibold"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
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

      {/* Contenu principal */}
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
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-900" size={20} />
            <span className="font-bold text-blue-900">VoteSystem</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                Tableau de bord
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock size={11} />
                  Actualisé à {lastUpdate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button onClick={() => chargerDonnees(true)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm self-start">
              <RefreshCw size={15} />
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i}
                    className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-500 text-xs md:text-sm font-medium">
                          {stat.label}
                        </p>
                        {stat.live && (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                      <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                    </div>
                    <p className={`text-3xl md:text-4xl font-bold ${stat.text}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Accès rapides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Link to="/admin/scrutins"
                  className="bg-blue-900 text-white rounded-2xl p-5 flex items-center justify-between hover:bg-blue-800 transition-colors group">
                  <div>
                    <p className="font-bold text-lg">Scrutins</p>
                    <p className="text-blue-200 text-sm mt-0.5">Gérer les élections</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Vote size={24} className="text-blue-300" />
                    <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link to="/admin/electeurs"
                  className="bg-white text-gray-800 rounded-2xl p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all group">
                  <div>
                    <p className="font-bold text-lg">Électeurs</p>
                    <p className="text-gray-400 text-sm mt-0.5">Gérer les comptes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={24} className="text-blue-900" />
                    <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link to="/admin/liste-blanche"
                  className="bg-white text-gray-800 rounded-2xl p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all group">
                  <div>
                    <p className="font-bold text-lg">Liste blanche</p>
                    <p className="text-gray-400 text-sm mt-0.5">Importer les étudiants</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={24} className="text-blue-900" />
                    <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link to="/admin/qrcodes"
                  className="bg-white text-gray-800 rounded-2xl p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all group">
                  <div>
                    <p className="font-bold text-lg">QR Codes</p>
                    <p className="text-gray-400 text-sm mt-0.5">Accès rapide étudiants</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode size={24} className="text-blue-900" />
                    <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link to="/admin/audit"
                  className="bg-white text-gray-800 rounded-2xl p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all group">
                  <div>
                    <p className="font-bold text-lg">Logs d'audit</p>
                    <p className="text-gray-400 text-sm mt-0.5">Traçabilité SHA-256</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={24} className="text-blue-900" />
                    <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Scrutins récents */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800">Scrutins récents</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {scrutins.length} scrutin(s) au total
                    </p>
                  </div>
                  <Link to="/admin/scrutins"
                    className="flex items-center gap-1 text-blue-900 text-sm font-semibold hover:underline">
                    Voir tout
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {scrutins.slice(0, 5).map((scrutin) => (
                    <div key={scrutin.id}
                      className="p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          scrutin.statut === "OUVERT"
                            ? "bg-green-500 animate-pulse"
                            : scrutin.statut === "BROUILLON"
                            ? "bg-amber-400"
                            : "bg-gray-300"
                        }`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm md:text-base">
                            {scrutin.titre}
                          </p>
                          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                            {scrutin.nb_eligibles} éligibles
                            {scrutin.filiere_cible && ` · ${scrutin.filiere_cible}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className={`hidden sm:block text-xs font-semibold px-3 py-1 rounded-full ${
                          scrutin.statut === "OUVERT"
                            ? "bg-green-100 text-green-700"
                            : scrutin.statut === "BROUILLON"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {scrutin.statut}
                        </span>
                        <Link to={`/admin/scrutins/${scrutin.id}/candidats`}
                          className="text-blue-900 hover:underline text-xs font-medium hidden md:block">
                          Voir
                        </Link>
                      </div>
                    </div>
                  ))}
                  {scrutins.length === 0 && (
                    <div className="p-12 text-center">
                      <Vote className="mx-auto text-gray-200 mb-3" size={40} />
                      <p className="text-gray-400 text-sm">Aucun scrutin créé.</p>
                      <Link to="/admin/scrutins"
                        className="inline-flex items-center gap-1 mt-4 text-blue-900 font-semibold text-sm hover:underline">
                        Créer un scrutin
                        <ChevronRight size={16} />
                      </Link>
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