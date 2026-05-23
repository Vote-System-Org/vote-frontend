import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

export default function PageConfirmPassword() {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();

  const uid   = searchParams.get('uid')   || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword]           = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    if (!uid || !token) {
      setError('Lien invalide ou expiré.');
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password/confirm/', {
        uid, token, password, password_confirm: passwordConfirm,
      });
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Succès */}
        {success && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <p className="font-bold text-gray-800 mb-2">
              Mot de passe réinitialisé !
            </p>
            <p className="text-gray-500 text-sm">
              Redirection vers la connexion dans 3 secondes...
            </p>
          </div>
        )}

        {/* Erreur lien invalide */}
        {!success && error && !uid && (
          <div className="text-center">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
            <Link to="/mot-de-passe/reset"
              className="text-blue-900 font-semibold hover:underline text-sm">
              Demander un nouveau lien
            </Link>
          </div>
        )}

        {/* Formulaire */}
        {!success && uid && token && (
          <>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Minimum 8 caractères"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Répéter le mot de passe"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}