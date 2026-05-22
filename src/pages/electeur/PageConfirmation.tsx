import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Vote, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import type { Candidat, Scrutin } from '../../types';

interface LocationState {
  scrutin_id:  number;
  candidat_id: number;
  candidat:    Candidat;
  scrutin:     Scrutin;
}

export default function PageConfirmation() {
  const navigate          = useNavigate();
  const location          = useLocation();
  const state             = location.state as LocationState;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Rediriger si pas de state
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Vote size={22} />
          <span className="font-bold">VoteSystem</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16">

        {/* Icône */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-full mb-4">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">
            Confirmer votre vote
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Cette action est irréversible. Vérifiez votre choix avant de confirmer.
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Récapitulatif de votre vote
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Scrutin</span>
              <span className="font-semibold text-gray-800 text-sm text-right max-w-48">
                {scrutin.titre}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">Votre choix</span>
              <span className="font-bold text-blue-900 text-sm">
                {candidat.est_vote_blanc
                  ? 'Vote blanc'
                  : `${candidat.nom} ${candidat.prenom || ''}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-amber-700 text-sm">
            Une fois votre vote confirmé, il ne pourra plus être modifié.
            Votre vote est chiffré et anonyme.
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Revenir
          </button>
          <button
            onClick={handleConfirmer}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <ShieldCheck size={18} />
            {loading ? 'Envoi...' : 'Confirmer le vote'}
          </button>
        </div>
      </div>
    </div>
  );
}