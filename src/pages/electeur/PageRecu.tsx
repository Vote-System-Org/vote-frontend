import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, Home, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface LocationState {
  recu: string;
}

export default function PageRecu() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const state          = location.state as LocationState;
  const [copie, setCopie] = useState(false);

  if (!state) {
    navigate('/espace/dashboard');
    return null;
  }

  const { recu } = state;

  const copierRecu = () => {
    navigator.clipboard.writeText(recu);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">

        {/* Icône succès */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Vote enregistré !
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Votre vote a été chiffré et enregistré de manière anonyme et sécurisée.
        </p>

        {/* Reçu */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-blue-900" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Votre reçu de vote (hash SHA-256)
            </p>
          </div>
          <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
            {recu}
          </p>
        </div>

        {/* Bouton copier */}
        <button
          onClick={copierRecu}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors mb-4"
        >
          <Copy size={18} />
          {copie ? 'Copié !' : 'Copier le reçu'}
        </button>

        {/* Retour dashboard */}
        <button
          onClick={() => navigate('/espace/dashboard')}
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <Home size={18} />
          Retour au tableau de bord
        </button>

        <p className="text-gray-400 text-xs mt-6">
          Conservez ce reçu pour vérifier votre vote ultérieurement.
        </p>
      </div>
    </div>
  );
}