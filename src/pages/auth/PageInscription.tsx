import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus, RefreshCw, Eye, EyeOff,
  ShieldCheck, CheckCircle, AlertCircle,
  Hash, Mail, Lock, ArrowRight
} from 'lucide-react';
import api from '../../api/axios';
import type { CaptchaData } from '../../types';

export default function PageInscription() {
  const navigate = useNavigate();

  const [matricule, setMatricule]             = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [captcha, setCaptcha]                 = useState<CaptchaData | null>(null);
  const [captchaValue, setCaptchaValue]       = useState('');
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const [visible, setVisible]                 = useState(false);

  useEffect(() => {
    chargerCaptcha();
    setTimeout(() => setVisible(true), 100);
  }, []);

  const chargerCaptcha = async () => {
    try {
      const response = await api.get('/auth/captcha/');
      setCaptcha(response.data);
      setCaptchaValue('');
    } catch {
      setError('Erreur lors du chargement du CAPTCHA.');
    }
  };

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
    setError('');
    setSuccess('');

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/inscription/', {
        matricule,
        email,
        password,
        password_confirm: passwordConfirm,
        captcha_key:      captcha?.captcha_key || '',
        captcha_value:    captchaValue,
      });
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { details?: Record<string, string[]>, message?: string } } };
      const details = error.response?.data?.details;
      if (details) {
        const firstError = Object.values(details)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError(error.response?.data?.message || "Erreur lors de l'inscription.");
      }
      chargerCaptcha();
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
              <UserPlus className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-bold text-white">Créer un compte</h1>
            <p className="text-blue-200 text-sm mt-1">
              Inscrivez-vous avec votre matricule officiel
            </p>
          </div>

          <div className="p-6 md:p-8">

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="flex-shrink-0" />{success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Matricule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Matricule
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={matricule}
                    onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                    placeholder="Ex: 21GL0045"
                    required />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Votre matricule doit figurer dans la liste officielle.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email institutionnel
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                    required />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-11 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 8 caractères"
                    required
                  />
                  <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Force du mot de passe */}
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

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className={`w-full pl-9 pr-11 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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

              {/* CAPTCHA */}
              {captcha && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Code de sécurité
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <img src={captcha.captcha_image_url} alt="CAPTCHA"
                      className="h-12 rounded-xl border border-gray-200 shadow-sm" />
                    <button type="button" onClick={chargerCaptcha}
                      className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
                      title="Rafraîchir">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <input type="text" value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest font-mono"
                    placeholder="Saisir le code ci-dessus"
                    required />
                </div>
              )}

              {/* Bouton */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md mt-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    S'inscrire
                    <ArrowRight size={16} className="ml-auto opacity-60" />
                  </>
                )}
              </button>
            </form>

            {/* Lien connexion */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-blue-900 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Info liste blanche */}
        <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-blue-300 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-blue-200 text-xs leading-relaxed">
              L'inscription est réservée aux étudiants figurant dans la liste officielle.
              Votre filière et niveau seront automatiquement renseignés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}