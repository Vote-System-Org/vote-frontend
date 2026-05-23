import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Vote, ArrowLeft, CheckCircle,
  ShieldCheck, Clock, Users, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import type { Scrutin, Candidat } from '../../types';

export default function PageVote() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [scrutin, setScrutin]     = useState<Scrutin | null>(null);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [selection, setSelection] = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    chargerDonnees();
    setTimeout(() => setVisible(true), 100);
  }, [id]);

  const chargerDonnees = async () => {
    try {
      const [scrutinRes, candidatsRes] = await Promise.all([
        api.get('/electeur/scrutins/'),
        api.get(`/electeur/scrutins/${id}/candidats/`),
      ]);
      const scrutins      = scrutinRes.data.results || scrutinRes.data;
      const scrutinTrouve = scrutins.find((s: Scrutin) => s.id === Number(id));
      setScrutin(scrutinTrouve || null);
      setCandidats(candidatsRes.data.results || candidatsRes.data);
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
    navigate(`/espace/scrutin/${id}/confirmer`, {
      state: {
        scrutin_id:  Number(id),
        candidat_id: selection,
        candidat:    candidats.find(c => c.id === selection),
        scrutin,
      }
    });
  };

  const candidatsReels = candidats.filter(c => !c.est_vote_blanc);
  const voteBlanc      = candidats.find(c => c.est_vote_blanc);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl px-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-4 md:px-8 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate('/espace/dashboard')}
          className="w-9 h-9 flex items-center justify-center bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm md:text-base truncate">VoteSystem</p>
            {scrutin && (
              <p className="text-blue-300 text-xs truncate hidden sm:block">{scrutin.titre}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs px-3 py-1.5 rounded-full border border-green-500/30">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          En cours
        </div>
      </nav>

      <div className={`max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* En-tête scrutin */}
        {scrutin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">
              {scrutin.titre}
            </h1>
            {scrutin.description && (
              <p className="text-gray-500 text-sm mb-3">{scrutin.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={13} />
                {scrutin.nb_eligibles} électeurs éligibles
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Clôture le {new Date(scrutin.date_fin).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Instruction */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
          Sélectionnez un candidat
        </p>

        {/* Candidats réels */}
        <div className="space-y-3 mb-6">
          {candidatsReels.map((candidat, i) => (
            <button key={candidat.id}
              onClick={() => { setSelection(candidat.id); setError(''); }}
              className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all text-left group ${
                selection === candidat.id
                  ? 'border-blue-900 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-full flex-shrink-0 overflow-hidden border-2 transition-all ${
                selection === candidat.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}>
                {candidat.photo ? (
                  <img src={candidat.photo}
                    alt={`${candidat.nom} ${candidat.prenom || ''}`}
                    className="w-14 h-14 object-cover object-center" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {candidat.nom.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm md:text-base transition-colors ${
                  selection === candidat.id ? 'text-blue-900' : 'text-gray-800'
                }`}>
                  {candidat.nom} {candidat.prenom}
                </p>
                {candidat.programme && (
                  <p className="text-gray-500 text-xs md:text-sm mt-0.5 line-clamp-2">
                    {candidat.programme}
                  </p>
                )}
              </div>

              {/* Indicateur sélection */}
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                selection === candidat.id
                  ? 'border-blue-900 bg-blue-900'
                  : 'border-gray-300 group-hover:border-blue-400'
              }`}>
                {selection === candidat.id && (
                  <CheckCircle size={14} className="text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Vote blanc */}
        {voteBlanc && (
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Ou
            </p>
            <button onClick={() => { setSelection(voteBlanc.id); setError(''); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                selection === voteBlanc.id
                  ? 'border-gray-600 bg-gray-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                selection === voteBlanc.id ? 'bg-gray-200 border-gray-500' : 'bg-gray-100 border-gray-200'
              }`}>
                <Vote size={22} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-700 text-sm md:text-base">Vote blanc</p>
                <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                  Voter sans choisir de candidat
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                selection === voteBlanc.id
                  ? 'border-gray-600 bg-gray-600'
                  : 'border-gray-300 group-hover:border-gray-400'
              }`}>
                {selection === voteBlanc.id && (
                  <CheckCircle size={14} className="text-white" />
                )}
              </div>
            </button>
          </div>
        )}

        {/* Bouton voter */}
        <button onClick={handleVoter} disabled={!selection}
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all text-sm md:text-base shadow-sm hover:shadow-md disabled:shadow-none">
          <Vote size={18} />
          {selection ? 'Confirmer ma sélection' : 'Sélectionnez un candidat'}
        </button>

        {/* Info sécurité */}
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
          <ShieldCheck size={13} />
          <span>Vote chiffré RSA 2048 — Anonymat garanti</span>
        </div>
      </div>
    </div>
  );
}