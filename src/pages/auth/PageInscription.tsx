import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import type { CaptchaData } from '../../types';

export default function PageInscription() {
  const navigate = useNavigate();

  const [matricule, setMatricule]       = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha]           = useState<CaptchaData | null>(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    chargerCaptcha();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
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
        setError(error.response?.data?.message || 'Erreur lors de l\'inscription.');
      }
      chargerCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Inscrivez-vous avec votre matricule officiel
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Succès */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Matricule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Matricule
            </label>
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 21GL0045"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email institutionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mot de passe
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

          {/* Confirmation mot de passe */}
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

          {/* CAPTCHA */}
          {captcha && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Code de sécurité
              </label>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={captcha.captcha_image_url}
                  alt="CAPTCHA"
                  className="h-12 rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={chargerCaptcha}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
                  title="Rafraîchir"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              <input
                type="text"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Saisir le code ci-dessus"
                required
              />
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-2"
          >
            <UserPlus size={18} />
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-blue-900 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}