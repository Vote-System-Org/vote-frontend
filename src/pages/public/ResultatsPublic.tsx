import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle,
  ArrowLeft, ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';
import type { Resultats } from '../../types';

export default function ResultatsPublic() {
  const { id }                      = useParams();
  const [resultats, setResultats]   = useState<Resultats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    chargerResultats();
  }, [id]);

  const chargerResultats = async () => {
    try {
      const response = await api.get(`/public/scrutins/${id}/resultats/`);
      setResultats(response.data.data);
    } catch {
      setError('Résultats non disponibles. Le scrutin n\'est peut-être pas encore clôturé.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement des résultats...</p>
      </div>
    );
  }

  if (error || !resultats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-600 font-medium">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 text-blue-900 font-semibold hover:underline text-sm"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const candidatsReels = resultats.resultats.filter(r => !r.est_vote_blanc);
  const voteBlanc      = resultats.resultats.find(r => r.est_vote_blanc);
  const gagnant        = candidatsReels.reduce((a, b) =>
    a.nb_voix > b.nb_voix ? a : b, candidatsReels[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-white" size={24} />
          <span className="text-white font-bold">VoteSystem</span>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 text-white text-sm hover:text-blue-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Accueil
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Titre */}
        <div className="text-center mb-8">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            SCRUTIN CLÔTURÉ
          </span>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">
            {resultats.titre}
          </h1>
        </div>

        {/* Stats participation */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 rounded-xl p-5 text-center text-white">
            <Users className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{resultats.nb_eligibles}</p>
            <p className="text-blue-200 text-sm">Éligibles</p>
          </div>
          <div className="bg-white/10 rounded-xl p-5 text-center text-white">
            <CheckCircle className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{resultats.nb_votants}</p>
            <p className="text-blue-200 text-sm">Votants</p>
          </div>
          <div className="bg-white/10 rounded-xl p-5 text-center text-white">
            <BarChart3 className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">{resultats.taux_participation}%</p>
            <p className="text-blue-200 text-sm">Participation</p>
          </div>
        </div>

        {/* Résultats candidats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-6">Résultats par candidat</h2>
          <div className="space-y-4">
            {candidatsReels
              .sort((a, b) => b.nb_voix - a.nb_voix)
              .map((candidat, index) => (
                <div key={candidat.candidat_id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          1er
                        </span>
                      )}
                      <span className="font-semibold text-gray-800 text-sm">
                        {candidat.nom} {candidat.prenom || ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-900">{candidat.nb_voix}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({candidat.pourcentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-900 h-2.5 rounded-full transition-all"
                      style={{ width: `${candidat.pourcentage}%` }}
                    />
                  </div>
                </div>
              ))
            }
          </div>

          {/* Vote blanc */}
          {voteBlanc && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-sm">Vote blanc</span>
                <div className="text-right">
                  <span className="font-bold text-gray-500">{voteBlanc.nb_voix}</span>
                  <span className="text-gray-400 text-sm ml-1">
                    ({voteBlanc.pourcentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${voteBlanc.pourcentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Abstentions */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Abstentions</span>
              <span className="text-gray-400">{resultats.nb_abstentions}</span>
            </div>
          </div>
        </div>

        {/* Gagnant */}
        {gagnant && gagnant.nb_voix > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <CheckCircle className="mx-auto text-amber-500 mb-3" size={32} />
            <p className="text-gray-500 text-sm mb-1">Élu(e)</p>
            <p className="text-2xl font-bold text-gray-800">
              {gagnant.nom} {gagnant.prenom || ''}
            </p>
            <p className="text-amber-600 font-semibold mt-1">
              {gagnant.nb_voix} voix — {gagnant.pourcentage}%
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-blue-300 text-xs mt-8">
          Résultats certifiés par hash chain SHA-256 — VoteSystem
        </p>
      </div>
    </div>
  );
}