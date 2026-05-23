import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

export default function PageResetPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/password/reset/', {
        email,
        frontend_url: window.location.origin,
      });
      setSuccess('Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail.');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
            Mot de passe oublié
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email institutionnel
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to="/connexion"
            className="flex items-center justify-center gap-2 text-sm text-blue-900 font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}