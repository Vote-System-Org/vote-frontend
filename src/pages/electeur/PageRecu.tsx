import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Copy, Home, ShieldCheck, Search, Mail, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LocationState {
  recu: string;
}

export default function PageRecu() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const state             = location.state as LocationState;
  const [copie, setCopie] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  if (!state) {
    navigate('/espace/dashboard');
    return null;
  }

  const { recu } = state;

  const copierRecu = () => {
    navigator.clipboard.writeText(recu);
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header vert */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 border-4 border-white/30">
              <CheckCircle className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Vote enregistré !
            </h1>
            <p className="text-green-100 text-sm">
              Votre bulletin a été chiffré et anonymisé avec succès
            </p>
          </div>

          <div className="p-6 md:p-8">

            {/* Reçu SHA-256 */}
            <div className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={14} className="text-blue-900" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reçu de vote — Hash SHA-256
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                  {recu}
                </p>
              </div>
              <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                <Mail size={11} />
                Ce reçu vous a également été envoyé par email.
              </p>
            </div>

            {/* Boutons actions */}
            <div className="space-y-3">

              {/* Vérifier */}
              <Link
                to={`/verifier-vote?hash=${recu}`}
                className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <Search size={16} />
                Vérifier mon vote
                <ExternalLink size={14} className="ml-auto opacity-60" />
              </Link>

              {/* Copier */}
              <button
                onClick={copierRecu}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all text-sm border-2 ${
                  copie
                    ? 'border-green-500 text-green-700 bg-green-50'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Copy size={16} />
                {copie ? 'Hash copié dans le presse-papiers !' : 'Copier le hash'}
              </button>

              {/* Dashboard */}
              <button
                onClick={() => navigate('/espace/dashboard')}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <Home size={16} />
                Retour au tableau de bord
              </button>
            </div>

            {/* Info anonymat */}
            <div className="mt-5 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-blue-700" size={14} />
                </div>
                <div>
                  <p className="text-blue-900 font-semibold text-xs mb-0.5">
                    Anonymat garanti
                  </p>
                  <p className="text-blue-600 text-xs leading-relaxed">
                    Ce reçu prouve que vous avez voté sans révéler votre choix.
                    Conservez-le pour vérifier ultérieurement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lien dashboard */}
        <p className="text-center text-blue-300 text-xs mt-4">
          Votre vote est définitif et ne peut pas être modifié.
        </p>
      </div>
    </div>
  );
}