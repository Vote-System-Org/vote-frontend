import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Vote, Plus, Play, Square, Trash2, BarChart3,
  Users, Clock, AlertCircle, ShieldCheck, FileText,
  LayoutDashboard, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { Scrutin } from '../../types';

export default function GestionScrutins() {
  const { logout }   = useNavigate ? useAuth() : useAuth();
  const navigate     = useNavigate();

  const [scrutins, setScrutins]     = useState<Scrutin[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Formulaire
  const [titre, setTitre]               = useState('');
  const [description, setDescription]   = useState('');
  const [dateDebut, setDateDebut]       = useState('');
  const [dateFin, setDateFin]           = useState('');
  const [filiereCible, setFiliereCible] = useState('');
  const [niveauCible, setNiveauCible]   = useState('');
  const [saving, setSaving]             = useState(false);

  useEffect(() => { chargerScrutins(); }, []);

  const chargerScrutins = async () => {
    try {
      const response = await api.get('/admin/scrutins/');
      setScrutins(response.data.results || response.data);
    } catch {
      setError('Erreur lors du chargement des scrutins.');
    } finally {
      setLoading(false);
    }
  };

  const creerScrutin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/scrutins/', {
        titre, description,
        date_debut:    dateDebut,
        date_fin:      dateFin,
        filiere_cible: filiereCible || null,
        niveau_cible:  niveauCible  || null,
      });
      setShowForm(false);
      resetForm();
      chargerScrutins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitre(''); setDescription(''); setDateDebut('');
    setDateFin(''); setFiliereCible(''); setNiveauCible('');
  };

  const ouvrir = async (id: number) => {
    try {
      await api.post(`/admin/scrutins/${id}/ouvrir/`);
      chargerScrutins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur ouverture.');
    }
  };

  const cloturer = async (id: number) => {
    if (!confirm('Clôturer ce scrutin ?')) return;
    try {
      await api.post(`/admin/scrutins/${id}/cloturer/`);
      chargerScrutins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur clôture.');
    }
  };

  const supprimer = async (id: number) => {
    if (!confirm('Supprimer ce scrutin ?')) return;
    try {
      await api.delete(`/admin/scrutins/${id}/`);
      chargerScrutins();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur suppression.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

  const navLinks = [
    { to: '/admin',               icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/scrutins',      icon: <Vote size={18} />,            label: 'Scrutins',        active: true },
    { to: '/admin/electeurs',     icon: <Users size={18} />,           label: 'Électeurs' },
    { to: '/admin/liste-blanche', icon: <FileText size={18} />,        label: 'Liste blanche' },
    { to: '/admin/audit',         icon: <ShieldCheck size={18} />,     label: "Logs d'audit" },
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
          <span className="font-bold text-blue-900">Scrutins</span>
        </header>

        <main className="flex-1 p-4 md:p-8">

          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Scrutins</h1>
              <p className="text-gray-500 text-sm mt-1">
                Gérer les élections de la plateforme
              </p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Plus size={18} />
              <span className="hidden sm:block">Nouveau scrutin</span>
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Formulaire création */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-800 mb-6">Nouveau scrutin</h2>
              <form onSubmit={creerScrutin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
                  <input type="text" value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Élection Délégué GL-L3 2025" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3} placeholder="Description optionnelle..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date début *</label>
                    <input type="datetime-local" value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date fin *</label>
                    <input type="datetime-local" value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Filière cible</label>
                    <select value={filiereCible}
                      onChange={(e) => setFiliereCible(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Toutes les filières</option>
                      <option value="GL">Génie Logiciel</option>
                      <option value="RSI">RSI</option>
                      <option value="MECA">Mécatronique</option>
                      <option value="GTS">GTS</option>
                      <option value="BAT">Génie Civil</option>
                      <option value="IIA">IIA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau cible</label>
                    <select value={niveauCible}
                      onChange={(e) => setNiveauCible(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tous les niveaux</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="M1">M1</option>
                      <option value="M2">M2</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                    <Plus size={16} />
                    {saving ? 'Création...' : 'Créer le scrutin'}
                  </button>
                  <button type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste scrutins */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {scrutins.map((scrutin) => (
                <div key={scrutin.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          scrutin.statut === 'OUVERT'
                            ? 'bg-green-100 text-green-700'
                            : scrutin.statut === 'BROUILLON'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {scrutin.statut}
                        </span>
                        {scrutin.filiere_cible && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                            {scrutin.filiere_cible}
                          </span>
                        )}
                        {scrutin.niveau_cible && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                            {scrutin.niveau_cible}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">
                        {scrutin.titre}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {scrutin.nb_eligibles} éligibles
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(scrutin.date_debut)} → {formatDate(scrutin.date_fin)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {scrutin.statut !== 'CLOTURE' && (
                        <Link to={`/admin/scrutins/${scrutin.id}/candidats`}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                          <Users size={14} />
                          Candidats ({scrutin.nb_candidats})
                        </Link>
                      )}
                      {(scrutin.statut === 'OUVERT' || scrutin.statut === 'CLOTURE') && (
                        <Link to={`/admin/scrutins/${scrutin.id}/resultats`}
                          className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
                          <BarChart3 size={14} />
                          Résultats
                        </Link>
                      )}
                      {scrutin.statut === 'BROUILLON' && (
                        <button onClick={() => ouvrir(scrutin.id)}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                          <Play size={14} />
                          Ouvrir
                        </button>
                      )}
                      {scrutin.statut === 'OUVERT' && (
                        <button onClick={() => cloturer(scrutin.id)}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                          <Square size={14} />
                          Clôturer
                        </button>
                      )}
                      {scrutin.statut === 'BROUILLON' && (
                        <button onClick={() => supprimer(scrutin.id)}
                          className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      )}
                      <ChevronRight size={16} className="text-gray-300 hidden md:block" />
                    </div>
                  </div>
                </div>
              ))}
              {scrutins.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <Vote className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">Aucun scrutin créé.</p>
                  <button onClick={() => setShowForm(true)}
                    className="mt-4 inline-flex items-center gap-2 text-blue-900 font-semibold text-sm hover:underline">
                    <Plus size={16} />
                    Créer un scrutin
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}