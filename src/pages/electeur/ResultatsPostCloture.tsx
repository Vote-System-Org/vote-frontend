import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3, ArrowLeft, Users, CheckCircle,
  ShieldCheck, Trophy, Hash, Clock
} from 'lucide-react';
import api from '../../api/axios';
import type { Resultats } from '../../types';
import GraphiqueResultats from '../../components/GraphiqueResultats';

export default function ResultatsPostCloture() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    chargerResultats();
    setTimeout(() => setVisible(true), 100);
  }, [id]);

  const chargerResultats = async () => {
    try {
      const response = await api.get(`/electeur/scrutins/${id}/resultats/`);
      setResultats(response.data.data);
    } catch {
      setError('Résultats non disponibles.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Chargement des résultats...</p>
      </div>
    </div>
  );

  if (error || !resultats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="text-gray-300" size={32} />
        </div>
        <p className="text-gray-700 font-semibold mb-2">Résultats indisponibles</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button onClick={() => navigate('/espace/dashboard')}
          className="inline-flex items-center gap-2 bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm">
          <ArrowLeft size={16} />
          Retour au dashboard
        </button>
      </div>
    </div>
  );

  const candidatsReels = resultats.resultats.filter(r => !r.est_vote_blanc);
  const voteBlanc      = resultats.resultats.find(r => r.est_vote_blanc);
  const maxVoix        = Math.max(...candidatsReels.map(c => c.nb_voix), 1);
  const gagnant        = candidatsReels.length > 0
    ? candidatsReels.reduce((a, b) => a.nb_voix > b.nb_voix ? a : b)
    : null;

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
            <p className="font-bold text-sm truncate">VoteSystem</p>
            <p className="text-blue-300 text-xs truncate hidden sm:block">
              {resultats.titre}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 bg-gray-500/20 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-500/30 flex-shrink-0">
          <CheckCircle size={12} />
          Clôturé
        </span>
      </nav>

      <div className={`max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
              SCRUTIN CLÔTURÉ
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">
            {resultats.titre}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Hash size={12} />
            <span>Résultats certifiés SHA-256</span>
            <span>·</span>
            <Clock size={12} />
            <span>Immuables</span>
          </div>
        </div>

        {/* Gagnant en haut */}
        {gagnant && gagnant.nb_voix > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 text-center mb-6 shadow-lg">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/30 rounded-full mb-3 border-2 border-white/40">
              <Trophy className="text-white" size={26} />
            </div>
            <p className="text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">Élu(e)</p>
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">
              {gagnant.nom} {gagnant.prenom || ''}
            </p>
            <p className="text-amber-100 font-semibold text-sm">
              {gagnant.nb_voix} voix — {gagnant.pourcentage}%
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { icon: <Users size={20} />, value: resultats.nb_eligibles, label: 'Éligibles', color: 'text-blue-900', bg: 'bg-blue-50' },
            { icon: <CheckCircle size={20} />, value: resultats.nb_votants, label: 'Votants', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: <BarChart3 size={20} />, value: `${resultats.taux_participation}%`, label: 'Participation', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-bold text-gray-800 mb-6 text-center text-lg">
            Répartition des votes
          </h2>
          <GraphiqueResultats
            resultats={resultats.resultats}
            nbAbstentions={resultats.nb_abstentions}
          />
        </div>

        {/* Résultats détaillés */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-5">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">Résultats détaillés</h2>
          <div className="space-y-5">
            {candidatsReels
              .sort((a, b) => b.nb_voix - a.nb_voix)
              .map((candidat, index) => (
                <div key={candidat.candidat_id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {index === 0 && candidat.nb_voix > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          1er
                        </span>
                      )}
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {candidat.nom} {candidat.prenom || ''}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="font-bold text-blue-900 text-sm">{candidat.nb_voix} voix</span>
                      <span className="text-gray-400 text-xs ml-1">({candidat.pourcentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        index === 0 ? 'bg-blue-900' : 'bg-blue-400'
                      }`}
                      style={{ width: `${maxVoix > 0 ? (candidat.nb_voix / maxVoix) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            }
          </div>

          {/* Vote blanc */}
          {voteBlanc && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-medium">Vote blanc</span>
                <span className="text-gray-500 text-sm font-bold">
                  {voteBlanc.nb_voix} voix ({voteBlanc.pourcentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full"
                  style={{ width: `${voteBlanc.pourcentage}%` }} />
              </div>
            </div>
          )}

          {/* Abstentions */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400">
            <span>Abstentions</span>
            <span className="font-medium">{resultats.nb_abstentions}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs px-4 py-2 rounded-full border border-blue-100">
            <ShieldCheck size={12} />
            Résultats certifiés et immuables — VoteSystem
          </div>
        </div>
      </div>
    </div>
  );
}