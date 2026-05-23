import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Users, Vote, FileText, ShieldCheck,
  Plus, Trash2, AlertCircle, ArrowLeft,
  LayoutDashboard, LogOut, User, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { Candidat, Scrutin } from '../../types';

export default function GestionCandidats() {
  const { scrutinId }  = useParams();
  const { logout }     = useAuth();
  const navigate       = useNavigate();

  const [scrutin, setScrutin]         = useState<Scrutin | null>(null);
  const [candidats, setCandidats]     = useState<Candidat[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [nom, setNom]             = useState('');
  const [prenom, setPrenom]       = useState('');
  const [email, setEmail]         = useState('');
  const [programme, setProgramme] = useState('');
  const [photo, setPhoto]         = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { chargerDonnees(); }, [scrutinId]);

  const chargerDonnees = async () => {
    try {
      const [scrutinRes, candidatsRes] = await Promise.all([
        api.get(`/admin/scrutins/${scrutinId}/`),
        api.get(`/admin/candidats/?scrutin_id=${scrutinId}`),
      ]);
      setScrutin(scrutinRes.data);
      setCandidats(candidatsRes.data.results || candidatsRes.data);
    } catch {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNom(''); setPrenom(''); setEmail(''); setProgramme(''); setPhoto(null);
  };

  const ajouterCandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const formData = new FormData();
      formData.append('scrutin', scrutinId!);
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      if (email) formData.append('email', email);
      formData.append('programme', programme);
      if (photo) formData.append('photo', photo);
      await api.post('/admin/candidats/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Candidat ajouté avec succès !');
      setShowForm(false);
      resetForm();
      chargerDonnees();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  const supprimerCandidat = async (id: number) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    try {
      await api.delete(`/admin/candidats/${id}/`);
      setSuccess('Candidat supprimé.');
      chargerDonnees();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur suppression.');
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

  const candidatsReels = candidats.filter(c => !c.est_vote_blanc);
  const voteBlanc      = candidats.find(c => c.est_vote_blanc);

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
          <span className="font-bold text-blue-900">Candidats</span>
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
                <h1 className="text-xl md:text-2xl font-bold text-blue-900">Candidats</h1>
                {scrutin && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-gray-500 text-sm truncate max-w-xs">{scrutin.titre}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      scrutin.statut === 'OUVERT'
                        ? 'bg-green-100 text-green-700'
                        : scrutin.statut === 'BROUILLON'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {scrutin.statut}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {scrutin?.statut === 'BROUILLON' && (
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Plus size={18} />
                Ajouter un candidat
              </button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Formulaire ajout */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
              <h2 className="font-bold text-gray-800 mb-6">Nouveau candidat</h2>
              <form onSubmit={ajouterCandidat} className="space-y-4">

                {/* Nom + Prénom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                    <input type="text" value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de famille" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                    <input type="text" value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email du candidat
                    <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="candidat@email.com" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Mail size={11} className="text-blue-400" />
                    <p className="text-blue-500 text-xs">
                      Les résultats seront envoyés à cet email à la clôture du scrutin.
                    </p>
                  </div>
                </div>

                {/* Programme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Programme électoral
                  </label>
                  <textarea value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3} placeholder="Programme du candidat..." />
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Photo
                    <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                  </label>
                  <input type="file" accept="image/jpeg,image/png"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100" />
                  <p className="text-gray-400 text-xs mt-1">JPEG ou PNG — max 2 Mo</p>
                </div>

                {/* Boutons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <><Plus size={16} />Ajouter</>
                    )}
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

          {/* Liste candidats */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">

              {/* Candidats réels */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Candidats réels</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {candidatsReels.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {candidatsReels.map((candidat) => (
                    <div key={candidat.id}
                      className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">

                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden border-2 border-blue-100 shadow-sm">
                        {candidat.photo ? (
                          <img src={candidat.photo}
                            alt={`${candidat.nom} ${candidat.prenom || ''}`}
                            className="w-14 h-14 object-cover object-center" />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {candidat.nom.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm md:text-base">
                          {candidat.nom} {candidat.prenom || ''}
                        </p>
                        {candidat.email && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail size={11} className="text-gray-400 flex-shrink-0" />
                            <p className="text-gray-400 text-xs truncate">{candidat.email}</p>
                          </div>
                        )}
                        {candidat.programme && (
                          <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">
                            {candidat.programme}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      {scrutin?.statut === 'BROUILLON' && (
                        <button onClick={() => supprimerCandidat(candidat.id)}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0">
                          <Trash2 size={13} />
                          <span className="hidden sm:block">Supprimer</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {candidatsReels.length === 0 && (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="text-gray-300" size={24} />
                      </div>
                      <p className="text-gray-400 text-sm">Aucun candidat ajouté.</p>
                      {scrutin?.statut === 'BROUILLON' && (
                        <button onClick={() => setShowForm(true)}
                          className="mt-3 inline-flex items-center gap-1 text-blue-900 font-semibold text-sm hover:underline">
                          <Plus size={14} />
                          Ajouter un candidat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vote blanc */}
              {voteBlanc && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Vote size={22} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-600">Vote Blanc</p>
                      <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        Créé automatiquement — non supprimable (RG03)
                      </p>
                    </div>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full flex-shrink-0">
                      Système
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}