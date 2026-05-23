import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle,
  ArrowLeft, ShieldCheck, Trophy,
  Hash, Clock
} from 'lucide-react';
import api from '../../api/axios';
import type { Resultats } from '../../types';
import GraphiqueResultats from '../../components/GraphiqueResultats';

export default function ResultatsPublic() {
  const { id }                    = useParams();
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
      const response = await api.get(`/public/scrutins/${id}/resultats/`);
      setResultats(response.data.data);
    } catch {
      setError("Résultats non disponibles. Le scrutin n'est peut-être pas encore clôturé.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Chargement des résultats...</p>
      </div>
    </div>
  );

  if (error || !resultats) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="text-gray-300" size={32} />
        </div>
        <p className="text-gray-700 font-semibold mb-2">Résultats indisponibles</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative overflow-hidden">

      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span className="text-white font-bold">VoteSystem</span>
        </Link>
        <Link to="/"
          className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
          <ArrowLeft size={15} />
          Accueil
        </Link>
      </nav>

      <div className={`max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* En-tête */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 mb-5">
            <CheckCircle size={13} />
            SCRUTIN CLÔTURÉ
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {resultats.titre}
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-300 text-xs">
            <Hash size={12} />
            <span>Résultats certifiés SHA-256</span>
          </div>
        </div>

        {/* Stats participation */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { icon: <Users size={20} />, value: resultats.nb_eligibles, label: 'Éligibles' },
            { icon: <CheckCircle size={20} />, value: resultats.nb_votants, label: 'Votants' },
            { icon: <BarChart3 size={20} />, value: `${resultats.taux_participation}%`, label: 'Participation' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 md:p-5 text-center text-white border border-white/10 hover:bg-white/15 transition-colors">
              <div className="flex justify-center mb-2 text-blue-300">{stat.icon}</div>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              <p className="text-blue-300 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Gagnant — affiché en premier */}
        {gagnant && gagnant.nb_voix > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 md:p-7 text-center mb-6 shadow-xl">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/30 rounded-full mb-4">
              <Trophy className="text-white" size={28} />
            </div>
            <p className="text-amber-900 text-sm font-semibold mb-1 uppercase tracking-wider">
              Élu(e)
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">
              {gagnant.nom} {gagnant.prenom || ''}
            </p>
            <p className="text-amber-100 font-semibold">
              {gagnant.nb_voix} voix — {gagnant.pourcentage}%
            </p>
          </div>
        )}

        {/* Graphique */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-5">
          <h2 className="font-bold text-gray-800 mb-6 text-center text-lg">
            Répartition des votes
          </h2>
          <GraphiqueResultats
            resultats={resultats.resultats}
            nbAbstentions={resultats.nb_abstentions}
          />
        </div>

        {/* Résultats détaillés */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-5">
          <h2 className="font-bold text-gray-800 mb-6 text-lg">Résultats par candidat</h2>
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
                      <span className="font-bold text-blue-900">{candidat.nb_voix}</span>
                      <span className="text-gray-400 text-sm ml-1">({candidat.pourcentage}%)</span>
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
                <div>
                  <span className="font-bold text-gray-500">{voteBlanc.nb_voix}</span>
                  <span className="text-gray-400 text-sm ml-1">({voteBlanc.pourcentage}%)</span>
                </div>
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
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs px-4 py-2 rounded-full border border-white/10">
            <Clock size={12} />
            Résultats certifiés et immuables — VoteSystem 2025-2026
          </div>
        </div>
      </div>
    </div>
  );
}