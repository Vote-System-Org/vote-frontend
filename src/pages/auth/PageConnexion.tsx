import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogIn, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { CaptchaData } from '../../types';

export default function PageConnexion() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [username, setUsername]         = useState(searchParams.get('matricule') || '');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha]           = useState<CaptchaData | null>(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) navigate('/espace/dashboard');
    if (isAuthenticated && isAdmin)  navigate('/admin');
  }, [isAuthenticated, isAdmin, navigate]);

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
    setLoading(true);
    try {
      await login(username, password, captcha?.captcha_key || '', captchaValue);
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.is_staff) {
          navigate('/admin');
        } else {
          navigate('/espace/dashboard');
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Identifiants incorrects.');
      chargerCaptcha();
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
          <h1 className="text-2xl font-bold text-blue-900">Vote Électronique</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
          {searchParams.get('matricule') && (
            <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
              Matricule pré-rempli depuis votre QR code
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Matricule ou Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 21GL0045"
              required
            />
          </div>

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
                placeholder="Votre mot de passe"
                required
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {captcha && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Code de sécurité
              </label>
              <div className="flex items-center gap-3 mb-2">
                <img src={captcha.captcha_image_url} alt="CAPTCHA"
                  className="h-12 rounded-lg border border-gray-200" />
                <button type="button" onClick={chargerCaptcha}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
                  title="Rafraîchir le CAPTCHA">
                  <RefreshCw size={18} />
                </button>
              </div>
              <input type="text" value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Saisir le code ci-dessus"
                required />
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
            <LogIn size={18} />
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <div className="text-center">
            <Link to="/mot-de-passe/reset"
              className="text-sm text-gray-400 hover:text-blue-900 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-blue-900 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}