import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, CheckCircle, XCircle,
  Vote, FileText, ShieldCheck,
  LayoutDashboard, LogOut, UserCheck, UserX,
  ChevronLeft, ChevronRight, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import api from '../../api/axios';
import type { Electeur } from '../../types';

const PAGE_SIZE = 10;

export default function GestionElecteurs() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [electeurs, setElecteurs]       = useState<Electeur[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);

  useEffect(() => {
    chargerElecteurs();
  }, [filtreStatut, page]);

  const chargerElecteurs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtreStatut) params.append('statut', filtreStatut);
      if (search)       params.append('search', search);
      params.append('page', String(page));
      params.append('page_size', String(PAGE_SIZE));
      const response = await api.get(`/admin/electeurs/?${params}`);
      setElecteurs(response.data.results || response.data);
      setTotal(response.data.count || response.data.length);
    } catch {
      toast.error('Erreur lors du chargement des électeurs.');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (id: number, statut: string) => {
    try {
      await api.patch(`/admin/electeurs/${id}/statut/`, { statut });
      toast.success('Statut mis à jour avec succès.');
      chargerElecteurs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur changement statut.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    chargerElecteurs();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const totalPages   = Math.ceil(total / PAGE_SIZE);
  const nbEligibles  = electeurs.filter(e => e.statut === 'ELIGIBLE').length;
  const nbSuspendus  = electeurs.filter(e => e.statut === 'SUSPENDU').length;
  const nbAttenteVal = electeurs.filter(e => e.statut === 'EN_ATTENTE').length;

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins' },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs', active: true },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche' },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
    { to: '/admin/qrcodes',       icon: <QrCode size={18} />,          label: 'QR Codes' },
  ];

  const badgeStatut = (statut: string) => {
    switch (statut) {
      case 'ELIGIBLE':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">ÉLIGIBLE</span>;
      case 'SUSPENDU':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">SUSPENDU</span>;
      default:
        return <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">EN ATTENTE</span>;
    }
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
          <span className="font-bold text-blue-900">Électeurs</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Électeurs</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total} électeur(s) au total
            </p>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { value: nbEligibles,  label: 'Éligibles',  color: 'text-green-600', bg: 'bg-green-50' },
              { value: nbAttenteVal, label: 'En attente', color: 'text-amber-500', bg: 'bg-amber-50' },
              { value: nbSuspendus,  label: 'Suspendus',  color: 'text-red-500',   bg: 'bg-red-50'   },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-gray-100 text-center`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par matricule, nom..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit"
                  className="bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-800 transition-colors">
                  Rechercher
                </button>
              </form>
              <select value={filtreStatut}
                onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les statuts</option>
                <option value="ELIGIBLE">Éligible</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Vue mobile */}
              <div className="block md:hidden space-y-3">
                {electeurs.map((electeur) => (
                  <div key={electeur.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {electeur.prenom} {electeur.nom}
                        </p>
                        <p className="text-gray-400 text-xs">{electeur.matricule}</p>
                      </div>
                      {badgeStatut(electeur.statut)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {electeur.filiere} — {electeur.niveau}
                      </span>
                      <div className="flex items-center gap-2">
                        {electeur.a_vote
                          ? <CheckCircle size={16} className="text-green-500" />
                          : <XCircle size={16} className="text-gray-300" />
                        }
                        {electeur.statut !== 'SUSPENDU' ? (
                          <button onClick={() => changerStatut(electeur.id, 'SUSPENDU')}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                            <UserX size={12} />
                            Suspendre
                          </button>
                        ) : (
                          <button onClick={() => changerStatut(electeur.id, 'ELIGIBLE')}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                            <UserCheck size={12} />
                            Réactiver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {electeurs.length === 0 && (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Users className="mx-auto text-gray-200 mb-3" size={40} />
                    <p className="text-gray-400 text-sm">Aucun électeur trouvé.</p>
                  </div>
                )}
              </div>

              {/* Vue desktop */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Électeur', 'Filière / Niveau', 'Statut', 'A voté', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
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
                          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                            {electeur.filiere} — {electeur.niveau}
                          </span>
                        </td>
                        <td className="px-6 py-4">{badgeStatut(electeur.statut)}</td>
                        <td className="px-6 py-4">
                          {electeur.a_vote
                            ? <CheckCircle size={18} className="text-green-500" />
                            : <XCircle size={18} className="text-gray-300" />
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {electeur.statut !== 'SUSPENDU' ? (
                              <button onClick={() => changerStatut(electeur.id, 'SUSPENDU')}
                                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                <UserX size={12} />
                                Suspendre
                              </button>
                            ) : (
                              <button onClick={() => changerStatut(electeur.id, 'ELIGIBLE')}
                                className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                                <UserCheck size={12} />
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-sm">
                    Page <span className="font-semibold text-gray-700">{page}</span> sur{' '}
                    <span className="font-semibold text-gray-700">{totalPages}</span>
                    {' '}— {total} électeur(s)
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => (
                        <>
                          {i > 0 && arr[i-1] !== p - 1 && (
                            <span key={`dots-${p}`} className="text-gray-400 text-sm px-1">...</span>
                          )}
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                              page === p
                                ? 'bg-blue-900 text-white'
                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                            {p}
                          </button>
                        </>
                      ))
                    }
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}