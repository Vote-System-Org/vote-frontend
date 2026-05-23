import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, Search, CheckCircle, XCircle,
  Hash, AlertCircle, Lock
} from 'lucide-react';
import api from '../../api/axios';

export default function VerifierVote() {
  const [searchParams]          = useSearchParams();
  const [hash, setHash]         = useState(searchParams.get('hash') || '');
  const [loading, setLoading]   = useState(false);
  const [resultat, setResultat] = useState<'valide' | 'invalide' | null>(null);
  const [error, setError]       = useState('');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
    if (searchParams.get('hash')) {
      verifier();
    }
  }, []);

  const verifier = async () => {
    if (!hash.trim()) {
      setError('Veuillez saisir un hash.');
      return;
    }
    setLoading(true);
    setError('');
    setResultat(null);
    try {
      await api.get(`/public/vote/verification/${hash.trim()}/`);
      setResultat('valide');
    } catch {
      setResultat('invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col relative overflow-hidden">

      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 px-4 md:px-8 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <span className="text-white font-bold text-lg">VoteSystem</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/connexion"
            className="text-blue-200 hover:text-white text-sm font-medium transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription"
            className="bg-white text-blue-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors hidden sm:block">
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-16 relative z-10">
        <div className={`w-full max-w-lg transition-all duration-700 ${
          animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>

          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl mb-5 border border-white/20">
              <Hash className="text-white" size={36} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Vérifier mon vote
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
              Collez votre hash de reçu pour confirmer que votre vote
              est bien enregistré dans le système.
            </p>
          </div>

          {/* Carte principale */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header carte */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="text-blue-900" size={16} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Vérification de bulletin</p>
                <p className="text-gray-400 text-xs">Système de preuve sans divulgation</p>
              </div>
            </div>

            <div className="p-6 md:p-8">

              {/* Champ hash */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hash SHA-256 de votre reçu
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    value={hash}
                    onChange={(e) => { setHash(e.target.value); setResultat(null); setError(''); }}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 focus:bg-white transition-colors"
                    rows={3}
                    placeholder="Ex: 0405a7d0ec010afc9797aec3d721751f..."
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1.5">
                  Ce hash vous a été envoyé par email après votre vote.
                </p>
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Bouton */}
              <button
                onClick={verifier}
                disabled={loading || !hash.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Vérifier mon vote
                  </>
                )}
              </button>

              {/* Résultat — Valide */}
              {resultat === 'valide' && (
                <div className="mt-5 bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                  <div className="bg-green-600 px-5 py-4 flex items-center gap-3">
                    <CheckCircle className="text-white flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-white">Vote confirmé</p>
                      <p className="text-green-100 text-xs">Votre participation est enregistrée</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-green-700 text-sm mb-4 leading-relaxed">
                      Ce reçu correspond à un bulletin de vote valide enregistré
                      dans le système. Votre participation est officiellement confirmée.
                    </p>
                    <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wider">
                        Hash vérifié
                      </p>
                      <p className="font-mono text-xs text-green-800 break-all leading-relaxed">
                        {hash}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Résultat — Invalide */}
              {resultat === 'invalide' && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-500 px-5 py-4 flex items-center gap-3">
                    <XCircle className="text-white flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-white">Hash non reconnu</p>
                      <p className="text-red-100 text-xs">Aucun vote ne correspond</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-red-700 text-sm leading-relaxed">
                      Ce hash ne correspond à aucun vote enregistré dans le système.
                      Vérifiez que vous avez copié le hash complet depuis votre email.
                    </p>
                  </div>
                </div>
              )}

              {/* Info anonymat */}
              <div className="mt-5 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="text-blue-700" size={15} />
                  </div>
                  <div>
                    <p className="text-blue-900 font-semibold text-sm mb-1">
                      Anonymat garanti
                    </p>
                    <p className="text-blue-600 text-xs leading-relaxed">
                      La vérification confirme uniquement que votre vote existe
                      dans le système. Elle ne révèle jamais le candidat
                      pour lequel vous avez voté.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lien retour */}
          <p className="text-center text-blue-300 text-sm mt-6">
            <Link to="/" className="hover:text-white transition-colors flex items-center justify-center gap-1">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}