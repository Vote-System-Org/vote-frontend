import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Vote, LogOut, Mail, BookOpen,
  GraduationCap, ShieldCheck, CheckCircle, Edit, Save, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function MonProfil() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [editMode, setEditMode]   = useState(false);
  const [email, setEmail]         = useState(user?.email || '');
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

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
      setSuccess('Profil mis à jour avec succès !');
      setEditMode(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
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
          <Link
            to="/espace/dashboard"
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            Dashboard
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

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-blue-900 mb-8">Mon profil</h1>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Carte profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-900 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <User className="text-white" size={36} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {user?.prenom} {user?.nom}
            </h2>
            <p className="text-blue-200 text-sm mt-1">{user?.matricule}</p>
          </div>

          {/* Infos */}
          <div className="p-6 space-y-4">

            {/* Email */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Mail className="text-blue-900 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </p>
                {editMode ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{user?.email}</p>
                )}
              </div>
            </div>

            {/* Filière */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <BookOpen className="text-blue-900 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Filière
                </p>
                <p className="text-gray-800 font-medium">{user?.filiere}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Non modifiable — source officielle
                </p>
              </div>
            </div>

            {/* Niveau */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <GraduationCap className="text-blue-900 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Niveau
                </p>
                <p className="text-gray-800 font-medium">{user?.niveau}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Non modifiable — source officielle
                </p>
              </div>
            </div>

            {/* Statut vote */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <ShieldCheck className="text-blue-900 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Statut de vote
                </p>
                {user?.a_vote ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      A voté
                    </span>
                    {user.date_vote && (
                      <span className="text-gray-400 text-xs">
                        le {new Date(user.date_vote).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    N'a pas encore voté
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <Save size={16} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setEmail(user?.email || ''); }}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <X size={16} />
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 border border-blue-900 text-blue-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Edit size={16} />
                Modifier l'email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}