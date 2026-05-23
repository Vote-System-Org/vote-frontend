import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Vote,
  AlertCircle, Lock, CheckCircle, User
} from 'lucide-react';
import api from '../../api/axios';
import type { Candidat, Scrutin } from '../../types';

interface LocationState {
  scrutin_id:  number;
  candidat_id: number;
  candidat:    Candidat;
  scrutin:     Scrutin;
}

export default function PageConfirmation() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = location.state as LocationState;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  if (!state) {
    navigate('/espace/dashboard');
    return null;
  }

  const { scrutin_id, candidat_id, candidat, scrutin } = state;

  const handleConfirmer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/electeur/vote/', {
        scrutin_id,
        candidat_id,
      });
      navigate('/espace/vote/recu', {
        state: { recu: response.data.data.recu }
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors du vote.');
    } finally {
      setLoading(false);
    }
  };

  const nomCandidat = candidat.est_vote_blanc
    ? 'Vote blanc'
    : `${candidat.nom} ${candidat.prenom || ''}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-4 md:px-8 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="font-bold text-sm">VoteSystem</p>
            <p className="text-blue-300 text-xs hidden sm:block">Confirmation du vote</p>
          </div>
        </div>
      </nav>

      <div className={`max-w-lg mx-auto px-4 md:px-6 py-10 md:py-16 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-2xl mb-5 border-4 border-blue-700">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
            Confirmer votre vote
          </h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Cette action est irréversible. Vérifiez attentivement votre choix.
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">

          {/* Header carte */}
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Récapitulatif de votre vote
            </p>
          </div>

          <div className="p-5 space-y-4">

            {/* Scrutin */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Vote className="text-blue-900" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Scrutin
                </p>
                <p className="font-semibold text-gray-800 text-sm">
                  {scrutin.titre}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Candidat choisi */}
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                candidat.est_vote_blanc ? 'bg-gray-100' : 'bg-green-100'
              }`}>
                {candidat.est_vote_blanc
                  ? <Vote className="text-gray-500" size={16} />
                  : <User className="text-green-700" size={16} />
                }
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Votre choix
                </p>
                <p className={`font-bold text-lg ${
                  candidat.est_vote_blanc ? 'text-gray-600' : 'text-blue-900'
                }`}>
                  {nomCandidat}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-amber-600" size={16} />
          </div>
          <p className="text-amber-700 text-sm leading-relaxed">
            Une fois confirmé, votre vote ne pourra plus être modifié.
            Votre bulletin sera chiffré en <strong>RSA 2048</strong> et anonymisé.
          </p>
        </div>

        {/* Info sécurité */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="text-blue-700" size={15} />
          </div>
          <p className="text-blue-700 text-sm leading-relaxed">
            Aucun lien ne sera établi entre votre identité et votre bulletin.
            Votre anonymat est garanti par architecture.
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />{error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate(-1)}
            className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Revenir
          </button>
          <button onClick={handleConfirmer} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-sm hover:shadow-md">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <ShieldCheck size={17} />
                Confirmer le vote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}