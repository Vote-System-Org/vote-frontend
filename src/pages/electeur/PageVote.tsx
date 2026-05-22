import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Vote, ArrowLeft, User, CheckSquare } from 'lucide-react';
import api from '../../api/axios';
import type { Scrutin, Candidat } from '../../types';

export default function PageVote() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [scrutin, setScrutin]           = useState<Scrutin | null>(null);
  const [candidats, setCandidats]       = useState<Candidat[]>([]);
  const [selection, setSelection]       = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  const chargerDonnees = async () => {
    try {
      const [scrutinRes, candidatsRes] = await Promise.all([
        api.get(`/electeur/scrutins/`),
        api.get(`/electeur/scrutins/${id}/candidats/`),
      ]);

      const scrutins = scrutinRes.data.results || scrutinRes.data;
      const scrutinTrouve = scrutins.find((s: Scrutin) => s.id === Number(id));
      setScrutin(scrutinTrouve || null);

      const tousLesCandidats = candidatsRes.data.results || candidatsRes.data;
      setCandidats(tousLesCandidats);
    } catch {
      setError('Erreur lors du chargement du scrutin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoter = () => {
    if (!selection) {
      setError('Veuillez sélectionner un candidat.');
      return;
    }
    // Naviguer vers la page de confirmation avec les données
    navigate(`/espace/scrutin/${id}/confirmer`, {
      state: {
        scrutin_id:  Number(id),
        candidat_id: selection,
        candidat:    candidats.find(c => c.id === selection),
        scrutin,
      }
    });
  };

  const candidatsReels  = candidats.filter(c => !c.est_vote_blanc);
  const voteBlanc       = candidats.find(c => c.est_vote_blanc);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/espace/dashboard')}
          className="flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <Vote size={22} />
          <span className="font-bold">VoteSystem</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Titre scrutin */}
        {scrutin && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-900">{scrutin.titre}</h1>
            {scrutin.description && (
              <p className="text-gray-500 text-sm mt-1">{scrutin.description}</p>
            )}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Candidats réels */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Candidats
          </h2>
          <div className="space-y-3">
            {candidatsReels.map((candidat) => (
              <button
                key={candidat.id}
                onClick={() => setSelection(candidat.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selection === candidat.id
                    ? 'border-blue-900 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {candidat.photo ? (
                    <img
                      src={candidat.photo}
                      alt={candidat.nom}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-blue-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {candidat.nom} {candidat.prenom}
                  </p>
                  {candidat.programme && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                      {candidat.programme}
                    </p>
                  )}
                </div>
                {selection === candidat.id && (
                  <CheckSquare className="text-blue-900 flex-shrink-0" size={22} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vote blanc */}
        {voteBlanc && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Vote blanc
            </h2>
            <button
              onClick={() => setSelection(voteBlanc.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selection === voteBlanc.id
                  ? 'border-gray-600 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Vote size={22} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700">Vote blanc</p>
                <p className="text-gray-400 text-sm">
                  Voter sans choisir de candidat
                </p>
              </div>
              {selection === voteBlanc.id && (
                <CheckSquare className="text-gray-600 flex-shrink-0" size={22} />
              )}
            </button>
          </div>
        )}

        {/* Bouton voter */}
        <button
          onClick={handleVoter}
          disabled={!selection}
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <Vote size={18} />
          Confirmer ma sélection
        </button>
      </div>
    </div>
  );
}