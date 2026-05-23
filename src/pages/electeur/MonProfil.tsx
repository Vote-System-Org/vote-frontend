import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Vote, LogOut, Mail, BookOpen,
  GraduationCap, ShieldCheck, CheckCircle,
  Edit, Save, X, ArrowLeft, Lock, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function MonProfil() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [email, setEmail]       = useState(user?.email || '');
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/auth/profil/', { email });
      setSuccess('Email mis à jour avec succès !');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const initiales = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase();

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
        <div className="flex items-center gap-3">
          <Link to="/espace/dashboard"
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg">
            <ArrowLeft size={15} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-red-300 transition-colors">
            <LogOut size={16} />
            <span className="hidden sm:block">Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className={`max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Mon profil</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <CheckCircle size={16} />{success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Carte profil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 px-6 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 border-4 border-white/30 text-2xl font-bold text-white">
                {initiales || <User size={32} />}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {user?.prenom} {user?.nom}
              </h2>
              <p className="text-blue-200 text-sm mt-1 font-mono">{user?.matricule}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  user?.statut === 'ELIGIBLE'
                    ? 'bg-green-500/30 text-green-100'
                    : 'bg-amber-500/30 text-amber-100'
                }`}>
                  {user?.statut}
                </span>
              </div>
            </div>
          </div>

          {/* Infos */}
          <div className="p-5 md:p-6 space-y-3">

            {/* Email */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="text-blue-900" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Email
                </p>
                {editMode ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-800 font-semibold text-sm truncate">{user?.email}</p>
                )}
              </div>
            </div>

            {/* Filière */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-purple-700" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Filière
                </p>
                <p className="text-gray-800 font-semibold text-sm">{user?.filiere}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Lock size={10} className="text-gray-400" />
                  <p className="text-gray-400 text-xs">Non modifiable — source officielle</p>
                </div>
              </div>
            </div>

            {/* Niveau */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="text-amber-700" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Niveau
                </p>
                <p className="text-gray-800 font-semibold text-sm">{user?.niveau}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Lock size={10} className="text-gray-400" />
                  <p className="text-gray-400 text-xs">Non modifiable — source officielle</p>
                </div>
              </div>
            </div>

            {/* Statut vote */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                user?.a_vote ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Vote className={user?.a_vote ? 'text-green-700' : 'text-gray-400'} size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Statut de vote
                </p>
                {user?.a_vote ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} />
                      A voté
                    </span>
                    {user.date_vote && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Calendar size={11} />
                        <span>{new Date(user.date_vote).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    N'a pas encore voté
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 md:px-6 pb-6 flex flex-wrap gap-3">
            {editMode ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                  <Save size={16} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setEmail(user?.email || ''); }}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  <X size={16} />
                  Annuler
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)}
                className="flex items-center gap-2 border-2 border-blue-900 text-blue-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                <Edit size={16} />
                Modifier l'email
              </button>
            )}
          </div>
        </div>

        {/* Lien vérifier vote */}
        {user?.a_vote && (
          <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-blue-900" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Vérifier mon vote</p>
                <p className="text-xs text-gray-400">Utiliser votre reçu SHA-256</p>
              </div>
            </div>
            <Link to="/verifier-vote"
              className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1">
              Accéder
              <ArrowLeft size={12} className="rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}