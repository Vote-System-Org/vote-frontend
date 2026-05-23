import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, CheckCircle, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

export default function PageConfirmPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const uid   = searchParams.get('uid')   || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [error, setError]                     = useState('');
  const [visible, setVisible]                 = useState(false);
  const [countdown, setCountdown]             = useState(3);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    if (!uid || !token) setError('Lien invalide ou expiré.');
  }, [uid, token]);

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(interval);
            navigate('/connexion');
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success]);

  const strength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 4;
    return 3;
  };

  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password/confirm/', {
        uid, token, password, password_confirm: passwordConfirm,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ShieldCheck size={20} />
            <span className="font-bold">VoteSystem</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 border border-white/20">
              <Lock className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
            <p className="text-blue-200 text-sm mt-1">Choisissez un mot de passe sécurisé</p>
          </div>

          <div className="p-6 md:p-8">

            {/* Succès */}
            {success && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">
                  Mot de passe réinitialisé !
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-blue-700 text-sm font-medium">
                    Redirection dans <span className="font-bold text-lg">{countdown}</span> seconde{countdown > 1 ? 's' : ''}...
                  </p>
                  <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    />
                  </div>
                </div>
                <Link to="/connexion"
                  className="inline-flex items-center gap-2 text-blue-900 font-semibold text-sm hover:underline">
                  Se connecter maintenant
                </Link>
              </div>
            )}

            {/* Lien invalide */}
            {!success && !uid && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="text-red-500" size={32} />
                </div>
                <h2 className="font-bold text-gray-800 mb-2">Lien invalide</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Ce lien de réinitialisation est invalide ou a expiré.
                </p>
                <Link to="/mot-de-passe/reset"
                  className="inline-flex items-center gap-2 bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm">
                  Demander un nouveau lien
                </Link>
              </div>
            )}

            {/* Formulaire */}
            {!success && uid && token && (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />{error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Nouveau mot de passe */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11"
                        placeholder="Minimum 8 caractères"
                        required
                      />
                      <button type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Indicateur force */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                              i <= strength() ? strengthColor[strength()] : 'bg-gray-200'
                            }`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          strength() >= 3 ? 'text-green-600' :
                          strength() >= 2 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {strengthLabel[strength()]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmer */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-11 transition-colors ${
                          passwordConfirm && password !== passwordConfirm
                            ? 'border-red-300 bg-red-50'
                            : passwordConfirm && password === passwordConfirm
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Répéter le mot de passe"
                        required
                      />
                      <button type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordConfirm && password === passwordConfirm && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle size={12} /> Les mots de passe correspondent
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md mt-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Réinitialiser le mot de passe
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Lien retour */}
            {!success && (
              <div className="mt-5 text-center">
                <Link to="/connexion"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-900 transition-colors">
                  <ArrowLeft size={14} />
                  Retour à la connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}