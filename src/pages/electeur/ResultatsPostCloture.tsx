import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Users, CheckCircle, Vote } from 'lucide-react';
import api from '../../api/axios';
import type { Resultats } from '../../types';
import GraphiqueResultats from '../../components/GraphiqueResultats';

export default function ResultatsPostCloture() {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [resultats, setResultats]       = useState<Resultats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    chargerResultats();
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

  const candidatsReels = resultats?.resultats.filter(r => !r.est_vote_blanc) || [];
  const voteBlanc      = resultats?.resultats.find(r => r.est_vote_blanc);
  const maxVoix        = Math.max(...candidatsReels.map(c => c.nb_voix), 1);
  const gagnant        = candidatsReels.reduce((a, b) =>
    a.nb_voix > b.nb_voix ? a : b, candidatsReels[0]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  if (error || !resultats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
        <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-600 font-medium">{error}</p>
        <button
          onClick={() => navigate('/espace/dashboard')}
          className="mt-6 text-blue-900 font-semibold hover:underline text-sm"
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );

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

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Titre */}
        <div className="mb-8">
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            SCRUTIN CLÔTURÉ
          </span>
          <h1 className="text-2xl font-bold text-blue-900 mt-3">
            {resultats.titre}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 text-center">
            <Users className="mx-auto text-blue-900 mb-2" size={22} />
            <p className="text-2xl font-bold text-blue-900">{resultats.nb_eligibles}</p>
            <p className="text-gray-500 text-sm">Éligibles</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={22} />
            <p className="text-2xl font-bold text-green-600">{resultats.nb_votants}</p>
            <p className="text-gray-500 text-sm">Votants</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 text-center">
            <BarChart3 className="mx-auto text-purple-600 mb-2" size={22} />
            <p className="text-2xl font-bold text-purple-600">
              {resultats.taux_participation}%
            </p>
            <p className="text-gray-500 text-sm">Participation</p>
          </div>
        </div>

        {/* Graphique */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          data-aos="fade-up">
          <h2 className="font-bold text-gray-800 mb-6 text-center">
            Répartition des votes
          </h2>
          <GraphiqueResultats
            resultats={resultats.resultats}
            nbAbstentions={resultats.nb_abstentions}
          />
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-6">Résultats</h2>
          <div className="space-y-5">
            {candidatsReels
              .sort((a, b) => b.nb_voix - a.nb_voix)
              .map((candidat, index) => (
                <div key={candidat.candidat_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      {index === 0 && candidat.nb_voix > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          1er
                        </span>
                      )}
                      <span className="font-semibold text-gray-800">
                        {candidat.nom} {candidat.prenom || ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-900">
                        {candidat.nb_voix} voix
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({candidat.pourcentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        index === 0 ? 'bg-blue-900' : 'bg-blue-400'
                      }`}
                      style={{
                        width: `${maxVoix > 0 ? (candidat.nb_voix / maxVoix) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))
            }
          </div>

          {/* Vote blanc */}
          {voteBlanc && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-500">Vote blanc</span>
                <span className="text-gray-500 font-medium">
                  {voteBlanc.nb_voix} voix ({voteBlanc.pourcentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${voteBlanc.pourcentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Gagnant */}
        {gagnant && gagnant.nb_voix > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
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
      </div>
    </div>
  );
}